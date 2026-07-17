from fastapi import APIRouter, Depends, Query

from app.api.dependencies import require_active_user, require_role
from app.schemas.activity_log import ActivityLogAction
from app.schemas.booking import (
    AdminBookingListResponse,
    AdminBookingResponse,
    AdminBookingReviewRequest,
    BookingCreateResponse,
    BookingDetailResponse,
    BookingListResponse,
    CreateBookingRequest,
)
from app.services.activity_log_service import ActivityLogService
from app.services.booking_service import BookingService


router = APIRouter()
admin_router = APIRouter()
booking_service = BookingService()
activity_log_service = ActivityLogService()


@router.post("", response_model=BookingCreateResponse, response_model_by_alias=False, status_code=201)
async def create_booking(
    request: CreateBookingRequest,
    current_user: dict = Depends(require_active_user),
) -> BookingCreateResponse:
    booking = await booking_service.create_booking(request, current_user)
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.BOOKING_CREATED,
        entity_type="BOOKING",
        entity_id=booking.id,
        description="Mahasiswa membuat permohonan peminjaman",
        metadata={"room_id": booking.room_id, "status": booking.status},
    )
    return BookingCreateResponse(
        message="Permohonan peminjaman berhasil dibuat",
        data=booking,
    )


@router.get("/me", response_model=BookingListResponse, response_model_by_alias=False)
async def list_my_bookings(
    status: str | None = None,
    room_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    sort: str = "-created_at",
    current_user: dict = Depends(require_active_user),
) -> BookingListResponse:
    items, meta = await booking_service.list_my_bookings(
        user_id=current_user["_id"],
        status=status,
        room_id=room_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        limit=limit,
        sort=sort,
    )
    return BookingListResponse(
        message="Riwayat peminjaman berhasil diambil",
        data=items,
        meta=meta,
    )


@router.get("/{booking_id}", response_model=BookingDetailResponse, response_model_by_alias=False)
async def get_booking_detail(
    booking_id: str,
    current_user: dict = Depends(require_active_user),
) -> BookingDetailResponse:
    booking = await booking_service.get_booking_detail(booking_id, current_user["_id"])
    return BookingDetailResponse(
        message="Detail peminjaman berhasil diambil",
        data=booking,
    )


@router.patch("/{booking_id}/cancel", response_model=BookingDetailResponse, response_model_by_alias=False)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(require_active_user),
) -> BookingDetailResponse:
    booking = await booking_service.cancel_booking(booking_id, current_user["_id"])
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.BOOKING_CANCELLED,
        entity_type="BOOKING",
        entity_id=booking.id,
        description="Mahasiswa membatalkan peminjaman",
        metadata={"new_status": booking.status},
    )
    return BookingDetailResponse(
        message="Peminjaman berhasil dibatalkan",
        data=booking,
    )


@admin_router.get("/bookings", response_model=AdminBookingListResponse, response_model_by_alias=False)
async def list_admin_bookings(
    status: str | None = None,
    room_id: str | None = None,
    user_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    sort: str = "-created_at",
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminBookingListResponse:
    items, meta = await booking_service.list_admin_bookings(
        status=status,
        room_id=room_id,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        limit=limit,
        sort=sort,
    )
    return AdminBookingListResponse(
        message="Daftar peminjaman berhasil diambil",
        data=items,
        meta=meta,
    )


@admin_router.get("/bookings/{booking_id}", response_model=AdminBookingResponse, response_model_by_alias=False)
async def get_admin_booking_detail(
    booking_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminBookingResponse:
    booking = await booking_service.get_admin_booking_detail(booking_id)
    return AdminBookingResponse(message="Detail peminjaman berhasil diambil", data=booking)


@admin_router.patch(
    "/bookings/{booking_id}/approve",
    response_model=AdminBookingResponse,
    response_model_by_alias=False,
)
async def approve_booking(
    booking_id: str,
    request: AdminBookingReviewRequest,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminBookingResponse:
    booking = await booking_service.approve_booking(booking_id, request, current_user["_id"])
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.BOOKING_APPROVED,
        entity_type="BOOKING",
        entity_id=booking.id,
        description="Admin menyetujui peminjaman",
        metadata={"new_status": booking.status, "admin_note": booking.admin_note},
    )
    return AdminBookingResponse(message="Peminjaman berhasil disetujui", data=booking)


@admin_router.patch(
    "/bookings/{booking_id}/reject",
    response_model=AdminBookingResponse,
    response_model_by_alias=False,
)
async def reject_booking(
    booking_id: str,
    request: AdminBookingReviewRequest,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminBookingResponse:
    booking = await booking_service.reject_booking(booking_id, request, current_user["_id"])
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.BOOKING_REJECTED,
        entity_type="BOOKING",
        entity_id=booking.id,
        description="Admin menolak peminjaman",
        metadata={"new_status": booking.status, "admin_note": booking.admin_note},
    )
    return AdminBookingResponse(message="Peminjaman berhasil ditolak", data=booking)


@admin_router.patch(
    "/bookings/{booking_id}/complete",
    response_model=AdminBookingResponse,
    response_model_by_alias=False,
)
async def complete_booking(
    booking_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminBookingResponse:
    booking = await booking_service.complete_booking(booking_id, current_user["_id"])
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.BOOKING_COMPLETED,
        entity_type="BOOKING",
        entity_id=booking.id,
        description="Admin menyelesaikan peminjaman",
        metadata={"new_status": booking.status},
    )
    return AdminBookingResponse(message="Peminjaman berhasil diselesaikan", data=booking)
