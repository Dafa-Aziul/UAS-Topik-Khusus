from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import ApiResponse, PaginationMeta


class ActivityLogAction:
    USER_REGISTERED = "USER_REGISTERED"
    USER_LOGGED_IN = "USER_LOGGED_IN"
    USER_LOGGED_OUT = "USER_LOGGED_OUT"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"
    BOOKING_CREATED = "BOOKING_CREATED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    BOOKING_APPROVED = "BOOKING_APPROVED"
    BOOKING_REJECTED = "BOOKING_REJECTED"
    BOOKING_COMPLETED = "BOOKING_COMPLETED"
    ROOM_CREATED = "ROOM_CREATED"
    ROOM_UPDATED = "ROOM_UPDATED"
    ROOM_STATUS_UPDATED = "ROOM_STATUS_UPDATED"
    ROOM_DELETED = "ROOM_DELETED"


class ActivityLogData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    actor_id: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str
    description: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    ip_address: str | None = None
    request_id: str | None = None
    created_at: datetime


class ActivityLogListResponse(ApiResponse):
    data: list[ActivityLogData]
    meta: PaginationMeta
