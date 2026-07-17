from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import ApiResponse, PaginationMeta


class BookingStatus:
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class CreateBookingRequest(BaseModel):
    room_id: str
    purpose: str = Field(min_length=3, max_length=255)
    participant_count: int = Field(ge=1, le=1000)
    start_at: datetime
    end_at: datetime
    user_note: str | None = Field(default=None, max_length=500)


class BookingUserSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    nim: str
    email: str
    role: str


class BookingRoomSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    code: str
    name: str
    building: str
    floor: int
    location_description: str
    capacity: int
    facilities: list[str]
    description: str | None = None
    image_url: str | None = None
    status: str


class BookingData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    booking_code: str
    user_id: str
    room_id: str
    purpose: str
    participant_count: int
    booking_date: str
    start_at: str
    end_at: str
    status: str
    user_note: str | None = None
    admin_note: str | None = None
    reviewed_by: str | None = None
    reviewed_at: str | None = None
    cancelled_by: str | None = None
    cancelled_at: str | None = None
    completed_by: str | None = None
    completed_at: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    user: BookingUserSummary | None = None
    room: BookingRoomSummary | None = None


class AdminBookingReviewRequest(BaseModel):
    admin_note: str | None = Field(default=None, max_length=500)


class BookingCreateResponse(ApiResponse):
    data: BookingData


class BookingDetailResponse(ApiResponse):
    data: BookingData


class BookingListResponse(ApiResponse):
    data: list[BookingData]
    meta: PaginationMeta


class AdminBookingListResponse(ApiResponse):
    data: list[BookingData]
    meta: PaginationMeta


class AdminBookingResponse(ApiResponse):
    data: BookingData
