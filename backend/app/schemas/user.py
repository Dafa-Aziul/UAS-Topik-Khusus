from datetime import datetime, timezone

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserDocument(BaseModel):
    id: str = Field(alias="_id")
    name: str
    nim: str
    email: str
    password_hash: str
    role: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
