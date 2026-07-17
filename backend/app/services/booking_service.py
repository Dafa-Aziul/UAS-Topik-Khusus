from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone
from math import ceil
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.repositories.booking_repository import BookingRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository
from app.schemas.booking import (
    AdminBookingReviewRequest,
    BookingData,
    BookingRoomSummary,
    BookingStatus,
    BookingUserSummary,
    CreateBookingRequest,
)
from app.schemas.common import PaginationMeta
from app.schemas.room import RoomStatus
from app.schemas.room import build_pagination_meta


class BookingService:
    def __init__(
        self,
        booking_repository: BookingRepository | None = None,
        room_repository: RoomRepository | None = None,
        user_repository: UserRepository | None = None,
    ):
        self.booking_repository = booking_repository or BookingRepository()
        self.room_repository = room_repository or RoomRepository()
        self.user_repository = user_repository or UserRepository()

    @staticmethod
    def _get_local_timezone(timezone_name: str):
        try:
            return ZoneInfo(timezone_name)
        except ZoneInfoNotFoundError:
            if timezone_name == "Asia/Jakarta":
                return timezone(timedelta(hours=7))
            return UTC

    @staticmethod
    def _sort_bookings(bookings: list[dict], sort: str) -> list[dict]:
        reverse = sort.startswith("-")
        sort_key = sort.lstrip("-")
        sortable_keys = {"booking_date", "created_at", "status", "start_at"}
        if sort_key not in sortable_keys:
            sort_key = "created_at"
        bookings.sort(key=lambda booking: booking.get(sort_key), reverse=reverse)
        return bookings

    async def _validate_approval_conflict(self, booking: dict) -> None:
        approved_bookings = await self.booking_repository.find_approved_by_room_and_date(
            booking["room_id"],
            datetime.fromisoformat(booking["start_at"]).date(),
        )
        start_at = datetime.fromisoformat(booking["start_at"])
        end_at = datetime.fromisoformat(booking["end_at"])
        for approved in approved_bookings:
            if approved["_id"] == booking["_id"]:
                continue
            existing_start = datetime.fromisoformat(approved["start_at"])
            existing_end = datetime.fromisoformat(approved["end_at"])
            if start_at < existing_end and end_at > existing_start:
                raise AppError(
                    "Ruangan telah digunakan pada rentang waktu tersebut",
                    "BOOKING_TIME_CONFLICT",
                    status_code=409,
                    details={"conflicting_booking_code": approved["booking_code"]},
                )

    async def create_booking(self, request: CreateBookingRequest, current_user: dict) -> BookingData:
        settings = get_settings()
        local_tz = self._get_local_timezone(settings.local_timezone)
        now_local = datetime.now(local_tz)
        start_local = request.start_at.astimezone(local_tz)
        end_local = request.end_at.astimezone(local_tz)

        if start_local.date() < now_local.date():
            raise AppError("Tanggal peminjaman tidak boleh di masa lalu", "VALIDATION_ERROR", status_code=422)
        if end_local <= start_local:
            raise AppError("Waktu selesai harus lebih besar dari waktu mulai", "VALIDATION_ERROR", status_code=422)

        duration_minutes = int((end_local - start_local).total_seconds() / 60)
        if duration_minutes < settings.booking_min_duration_minutes:
            raise AppError("Durasi peminjaman terlalu singkat", "VALIDATION_ERROR", status_code=422)
        if duration_minutes > settings.booking_max_duration_hours * 60:
            raise AppError("Durasi peminjaman melebihi batas maksimum", "VALIDATION_ERROR", status_code=422)
        if (start_local.date() - now_local.date()).days > settings.booking_max_advance_days:
            raise AppError("Jadwal peminjaman terlalu jauh", "VALIDATION_ERROR", status_code=422)

        opening_time = datetime.strptime(settings.booking_open_hour, "%H:%M").time()
        closing_time = datetime.strptime(settings.booking_close_hour, "%H:%M").time()
        if start_local.time() < opening_time or end_local.time() > closing_time:
            raise AppError("Jadwal berada di luar jam operasional", "VALIDATION_ERROR", status_code=422)

        room = await self.room_repository.find_by_id(request.room_id)
        if room is None or room.get("is_deleted", False):
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        if room["status"] != RoomStatus.AVAILABLE:
            raise AppError("Ruangan tidak dapat dipinjam", "ROOM_NOT_AVAILABLE", status_code=409)
        if request.participant_count > room["capacity"]:
            raise AppError("Jumlah peserta melebihi kapasitas ruangan", "VALIDATION_ERROR", status_code=422)

        approved_bookings = await self.booking_repository.find_approved_by_room_and_date(
            request.room_id,
            start_local.date(),
        )
        for booking in approved_bookings:
            existing_start = datetime.fromisoformat(booking["start_at"])
            existing_end = datetime.fromisoformat(booking["end_at"])
            if start_local < existing_end and end_local > existing_start:
                raise AppError(
                    "Ruangan telah digunakan pada rentang waktu tersebut",
                    "BOOKING_TIME_CONFLICT",
                    status_code=409,
                    details={"conflicting_booking_code": booking["booking_code"]},
                )

        booking_code = f"BKG-{now_local.strftime('%Y%m%d')}-{request.room_id[-4:].upper()}"
        booking = await self.booking_repository.create_booking(
            {
                "booking_code": booking_code,
                "user_id": current_user["_id"],
                "room_id": request.room_id,
                "purpose": request.purpose,
                "participant_count": request.participant_count,
                "booking_date": start_local.date().isoformat(),
                "start_at": start_local.isoformat(),
                "end_at": end_local.isoformat(),
                "status": BookingStatus.PENDING,
                "user_note": request.user_note,
                "admin_note": None,
                "cancelled_by": None,
                "cancelled_at": None,
                "completed_by": None,
                "completed_at": None,
            }
        )
        return await self._build_booking_detail(booking)

    async def list_my_bookings(
        self,
        *,
        user_id: str,
        status: str | None,
        room_id: str | None,
        date_from: str | None,
        date_to: str | None,
        page: int,
        limit: int,
        sort: str,
    ) -> tuple[list[BookingData], PaginationMeta]:
        bookings = await self.booking_repository.list_by_user(user_id)

        if status:
            bookings = [booking for booking in bookings if booking["status"] == status]
        if room_id:
            bookings = [booking for booking in bookings if booking["room_id"] == room_id]
        if date_from:
            bookings = [booking for booking in bookings if booking["booking_date"] >= date_from]
        if date_to:
            bookings = [booking for booking in bookings if booking["booking_date"] <= date_to]

        bookings = self._sort_bookings(bookings, sort)

        total_items = len(bookings)
        start = (page - 1) * limit
        end = start + limit
        items = [await self._build_booking_detail(booking) for booking in bookings[start:end]]
        total_pages = max(1, ceil(total_items / limit)) if limit > 0 else 1
        meta = PaginationMeta(
            page=page,
            limit=limit,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
        )
        return items, meta

    async def get_booking_detail(self, booking_id: str, user_id: str) -> BookingData:
        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None or booking["user_id"] != user_id:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        return await self._build_booking_detail(booking)

    async def cancel_booking(self, booking_id: str, user_id: str) -> BookingData:
        settings = get_settings()
        local_tz = self._get_local_timezone(settings.local_timezone)
        now_local = datetime.now(local_tz)

        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None or booking["user_id"] != user_id:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        if booking["status"] not in {BookingStatus.PENDING, BookingStatus.APPROVED}:
            raise AppError("Peminjaman tidak dapat dibatalkan", "BOOKING_CANNOT_BE_CANCELLED", status_code=409)

        start_at = datetime.fromisoformat(booking["start_at"])
        if start_at <= now_local:
            raise AppError("Peminjaman tidak dapat dibatalkan", "BOOKING_CANNOT_BE_CANCELLED", status_code=409)

        cancellation_deadline = start_at - timedelta(hours=settings.booking_cancellation_limit_hours)
        if now_local > cancellation_deadline:
            raise AppError("Peminjaman tidak dapat dibatalkan", "BOOKING_CANNOT_BE_CANCELLED", status_code=409)

        updated = await self.booking_repository.update_booking(
            booking_id,
            {
                "status": BookingStatus.CANCELLED,
                "cancelled_by": user_id,
                "cancelled_at": now_local.isoformat(),
            },
        )
        return await self._build_booking_detail(updated)

    async def list_admin_bookings(
        self,
        *,
        status: str | None,
        room_id: str | None,
        user_id: str | None,
        date_from: str | None,
        date_to: str | None,
        page: int,
        limit: int,
        sort: str,
    ) -> tuple[list[BookingData], PaginationMeta]:
        bookings = await self.booking_repository.list_all()
        if status:
            bookings = [booking for booking in bookings if booking["status"] == status]
        if room_id:
            bookings = [booking for booking in bookings if booking["room_id"] == room_id]
        if user_id:
            bookings = [booking for booking in bookings if booking["user_id"] == user_id]
        if date_from:
            bookings = [booking for booking in bookings if booking["booking_date"] >= date_from]
        if date_to:
            bookings = [booking for booking in bookings if booking["booking_date"] <= date_to]

        bookings = self._sort_bookings(bookings, sort)
        total_items = len(bookings)
        start = (page - 1) * limit
        end = start + limit
        items = [await self._build_booking_detail(booking) for booking in bookings[start:end]]
        return items, build_pagination_meta(page=page, limit=limit, total_items=total_items)

    async def get_admin_booking_detail(self, booking_id: str) -> BookingData:
        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        return await self._build_booking_detail(booking)

    async def _build_booking_detail(self, booking: dict) -> BookingData:
        user = await self.user_repository.find_by_id(booking["user_id"])
        room = await self.room_repository.find_by_id(booking["room_id"])

        payload = dict(booking)
        if user is not None:
            payload["user"] = BookingUserSummary.model_validate(user).model_dump(by_alias=True)
        if room is not None:
            payload["room"] = BookingRoomSummary.model_validate(room).model_dump(by_alias=True)

        return BookingData.model_validate(payload)

    async def approve_booking(
        self,
        booking_id: str,
        request: AdminBookingReviewRequest,
        admin_user_id: str,
    ) -> BookingData:
        settings = get_settings()
        local_tz = self._get_local_timezone(settings.local_timezone)
        now_local = datetime.now(local_tz)
        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        if booking["status"] != BookingStatus.PENDING:
            raise AppError("Status peminjaman tidak dapat disetujui", "INVALID_BOOKING_STATUS", status_code=409)
        if datetime.fromisoformat(booking["start_at"]) <= now_local:
            raise AppError("Peminjaman yang sudah lewat tidak dapat disetujui", "INVALID_BOOKING_STATUS", status_code=409)

        await self._validate_approval_conflict(booking)
        updated = await self.booking_repository.update_booking(
            booking_id,
            {
                "status": BookingStatus.APPROVED,
                "admin_note": request.admin_note,
                "reviewed_by": admin_user_id,
                "reviewed_at": now_local.isoformat(),
            },
        )
        return await self._build_booking_detail(updated)

    async def reject_booking(
        self,
        booking_id: str,
        request: AdminBookingReviewRequest,
        admin_user_id: str,
    ) -> BookingData:
        settings = get_settings()
        local_tz = self._get_local_timezone(settings.local_timezone)
        now_local = datetime.now(local_tz)
        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        if booking["status"] != BookingStatus.PENDING:
            raise AppError("Status peminjaman tidak dapat ditolak", "INVALID_BOOKING_STATUS", status_code=409)

        updated = await self.booking_repository.update_booking(
            booking_id,
            {
                "status": BookingStatus.REJECTED,
                "admin_note": request.admin_note,
                "reviewed_by": admin_user_id,
                "reviewed_at": now_local.isoformat(),
            },
        )
        return await self._build_booking_detail(updated)

    async def complete_booking(self, booking_id: str, admin_user_id: str) -> BookingData:
        settings = get_settings()
        local_tz = self._get_local_timezone(settings.local_timezone)
        now_local = datetime.now(local_tz)
        booking = await self.booking_repository.find_by_id(booking_id)
        if booking is None:
            raise AppError("Peminjaman tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        if booking["status"] != BookingStatus.APPROVED:
            raise AppError("Status peminjaman tidak dapat diselesaikan", "INVALID_BOOKING_STATUS", status_code=409)

        updated = await self.booking_repository.update_booking(
            booking_id,
            {
                "status": BookingStatus.COMPLETED,
                "completed_by": admin_user_id,
                "completed_at": now_local.isoformat(),
            },
        )
        return await self._build_booking_detail(updated)
