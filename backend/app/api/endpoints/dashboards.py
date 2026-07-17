from fastapi import APIRouter, Depends

from app.api.dependencies import require_active_user, require_role
from app.schemas.dashboard import (
    AdminDashboardResponse,
    BookingTrendResponse,
    RoomUsageResponse,
    StudentDashboardResponse,
)
from app.services.dashboard_service import DashboardService


router = APIRouter()
dashboard_service = DashboardService()


@router.get("/admin", response_model=AdminDashboardResponse)
async def get_admin_dashboard(current_user: dict = Depends(require_role("ADMIN"))) -> AdminDashboardResponse:
    summary = await dashboard_service.get_admin_summary()
    return AdminDashboardResponse(message="Dashboard admin berhasil diambil", data=summary)


@router.get("/admin/booking-trend", response_model=BookingTrendResponse)
async def get_booking_trend(current_user: dict = Depends(require_role("ADMIN"))) -> BookingTrendResponse:
    trend = await dashboard_service.get_booking_trend()
    return BookingTrendResponse(message="Tren peminjaman berhasil diambil", data=trend)


@router.get("/admin/room-usage", response_model=RoomUsageResponse)
async def get_room_usage(current_user: dict = Depends(require_role("ADMIN"))) -> RoomUsageResponse:
    usage = await dashboard_service.get_room_usage()
    return RoomUsageResponse(message="Penggunaan ruangan berhasil diambil", data=usage)


@router.get("/me", response_model=StudentDashboardResponse)
async def get_student_dashboard(current_user: dict = Depends(require_active_user)) -> StudentDashboardResponse:
    summary = await dashboard_service.get_student_summary(current_user["_id"])
    return StudentDashboardResponse(message="Dashboard mahasiswa berhasil diambil", data=summary)
