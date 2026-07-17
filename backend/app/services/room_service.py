from __future__ import annotations

from datetime import date

from app.core.exceptions import AppError
from app.repositories.booking_repository import BookingRepository
from app.repositories.room_repository import RoomRepository
from app.schemas.room import (
    AvailabilitySlot,
    RoomAvailabilityData,
    AdminRoomCreateRequest,
    AdminRoomUpdateRequest,
    RoomData,
    RoomStatus,
    build_pagination_meta,
)


class RoomService:
    def __init__(
        self,
        room_repository: RoomRepository | None = None,
        booking_repository: BookingRepository | None = None,
    ):
        self.room_repository = room_repository or RoomRepository()
        self.booking_repository = booking_repository or BookingRepository()

    async def list_rooms(
        self,
        *,
        search: str | None,
        building: str | None,
        status: str | None,
        min_capacity: int | None,
        facility: str | None,
        page: int,
        limit: int,
        sort: str,
    ) -> tuple[list[RoomData], object]:
        rooms = await self.room_repository.list_public_rooms()
        filtered = rooms

        if search:
            keyword = search.lower()
            filtered = [
                room
                for room in filtered
                if keyword in room["name"].lower()
                or keyword in room["code"].lower()
                or keyword in room["building"].lower()
            ]
        if building:
            filtered = [room for room in filtered if room["building"].lower() == building.lower()]
        if status:
            filtered = [room for room in filtered if room["status"] == status]
        if min_capacity is not None:
            filtered = [room for room in filtered if room["capacity"] >= min_capacity]
        if facility:
            facility_lc = facility.lower()
            filtered = [
                room for room in filtered if any(item.lower() == facility_lc for item in room["facilities"])
            ]

        reverse = sort.startswith("-")
        sort_key = sort.lstrip("-")
        sortable_keys = {"name", "capacity", "building", "created_at"}
        if sort_key not in sortable_keys:
            sort_key = "name"
        filtered.sort(key=lambda room: room.get(sort_key), reverse=reverse)

        total_items = len(filtered)
        start = (page - 1) * limit
        end = start + limit
        items = [RoomData.model_validate(room) for room in filtered[start:end]]
        meta = build_pagination_meta(page=page, limit=limit, total_items=total_items)
        return items, meta

    async def get_room_detail(self, room_id: str) -> RoomData:
        room = await self.room_repository.find_public_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        return RoomData.model_validate(room)

    async def get_room_availability(self, room_id: str, booking_day: date) -> RoomAvailabilityData:
        room = await self.room_repository.find_public_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)

        approved_bookings = await self.booking_repository.find_approved_by_room_and_date(room_id, booking_day)
        blocked_slots = [
            AvailabilitySlot(
                start_at=booking["start_at"],
                end_at=booking["end_at"],
                booking_id=booking["_id"],
            )
            for booking in approved_bookings
        ]
        return RoomAvailabilityData(
            room_id=room_id,
            date=booking_day,
            room_status=room["status"],
            is_bookable=room["status"] == RoomStatus.AVAILABLE,
            blocked_slots=blocked_slots,
        )

    async def create_room(self, payload: AdminRoomCreateRequest, actor_id: str) -> RoomData:
        existing = await self.room_repository.find_by_code(payload.code)
        if existing is not None:
            raise AppError("Kode ruangan sudah digunakan", "ROOM_CODE_ALREADY_EXISTS", status_code=409)
        room = await self.room_repository.create_room({**payload.model_dump(), "actor_id": actor_id})
        return RoomData.model_validate(room)

    async def update_room(self, room_id: str, payload: AdminRoomUpdateRequest, actor_id: str) -> RoomData:
        room = await self.room_repository.find_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        updates = {key: value for key, value in payload.model_dump().items() if value is not None}
        updated = await self.room_repository.update_room(room_id, updates, actor_id)
        return RoomData.model_validate(updated)

    async def get_room_for_admin(self, room_id: str) -> RoomData:
        room = await self.room_repository.find_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        return RoomData.model_validate(room)

    async def update_room_status(self, room_id: str, status: str, actor_id: str) -> RoomData:
        if status not in {RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE, RoomStatus.INACTIVE}:
            raise AppError("Status ruangan tidak valid", "VALIDATION_ERROR", status_code=422)
        room = await self.room_repository.find_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        updated = await self.room_repository.update_room(room_id, {"status": status}, actor_id)
        return RoomData.model_validate(updated)

    async def delete_room(self, room_id: str, actor_id: str) -> None:
        room = await self.room_repository.find_by_id(room_id)
        if room is None:
            raise AppError("Ruangan tidak ditemukan", "RESOURCE_NOT_FOUND", status_code=404)
        await self.room_repository.soft_delete_room(room_id, actor_id)
