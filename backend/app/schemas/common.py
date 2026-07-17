from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ErrorInfo(BaseModel):
    code: str
    details: Any | None = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Any | None = None
    meta: PaginationMeta | None = None
    request_id: str | None = None
    timestamp: str = Field(default_factory=utc_now_iso)


class ApiErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: ErrorInfo
    request_id: str | None = None
    timestamp: str = Field(default_factory=utc_now_iso)

