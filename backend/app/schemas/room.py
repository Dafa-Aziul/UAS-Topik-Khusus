from __future__ import annotations

from datetime import date
from math import ceil

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import ApiResponse, PaginationMeta


class RoomStatus:
    AVAILABLE = "AVAILABLE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"


class RoomData(BaseModel):
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


class AdminRoomCreateRequest(BaseModel):
    code: str = Field(min_length=3, max_length=30)
    name: str = Field(min_length=3, max_length=120)
    building: str = Field(min_length=1, max_length=100)
    floor: int = Field(ge=0, le=100)
    location_description: str = Field(min_length=3, max_length=255)
    capacity: int = Field(ge=1, le=1000)
    facilities: list[str] = Field(default_factory=list)
    description: str | None = None
    image_url: str | None = None
    status: str = RoomStatus.AVAILABLE


class AdminRoomUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=120)
    building: str | None = Field(default=None, min_length=1, max_length=100)
    floor: int | None = Field(default=None, ge=0, le=100)
    location_description: str | None = Field(default=None, min_length=3, max_length=255)
    capacity: int | None = Field(default=None, ge=1, le=1000)
    facilities: list[str] | None = None
    description: str | None = None
    image_url: str | None = None
    status: str | None = None


class AdminRoomStatusUpdateRequest(BaseModel):
    status: str


class RoomListResponse(ApiResponse):
    data: list[RoomData]
    meta: PaginationMeta


class RoomDetailResponse(ApiResponse):
    data: RoomData


class AdminRoomResponse(ApiResponse):
    data: RoomData


class AvailabilitySlot(BaseModel):
    start_at: str
    end_at: str
    booking_id: str | None = None


class RoomAvailabilityData(BaseModel):
    room_id: str
    date: date
    room_status: str
    is_bookable: bool
    blocked_slots: list[AvailabilitySlot]


class RoomAvailabilityResponse(ApiResponse):
    data: RoomAvailabilityData


def build_pagination_meta(*, page: int, limit: int, total_items: int) -> PaginationMeta:
    total_pages = max(1, ceil(total_items / limit)) if limit > 0 else 1
    return PaginationMeta(
        page=page,
        limit=limit,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
    )
