from __future__ import annotations

from pydantic import BaseModel

from app.schemas.common import ApiResponse


class AdminDashboardSummary(BaseModel):
    total_active_students: int
    total_rooms: int
    booking_status_summary: dict[str, int]


class RoomUsageItem(BaseModel):
    room_id: str
    room_name: str
    total_bookings: int


class BookingTrendItem(BaseModel):
    booking_date: str
    total_bookings: int


class StudentDashboardSummary(BaseModel):
    total_bookings: int
    pending_bookings: int
    approved_bookings: int
    completed_bookings: int
    cancelled_bookings: int


class AdminDashboardResponse(ApiResponse):
    data: AdminDashboardSummary


class RoomUsageResponse(ApiResponse):
    data: list[RoomUsageItem]


class BookingTrendResponse(ApiResponse):
    data: list[BookingTrendItem]


class StudentDashboardResponse(ApiResponse):
    data: StudentDashboardSummary
