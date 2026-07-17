from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Roomify API"
    app_env: Literal["development", "test", "production"] = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    api_v1_prefix: str = "/"
    frontend_origins: str = "http://localhost:3000"

    mongodb_uri: str = Field(..., description="MongoDB connection string")
    mongodb_database: str = Field(..., description="MongoDB database name")

    redis_url: str = Field(..., description="Redis connection string")
    redis_enabled: bool = True
    redis_key_prefix: str = "roomify"

    jwt_secret_key: str = Field(..., description="JWT signing secret")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    password_min_length: int = 8

    local_timezone: str = "Asia/Jakarta"
    booking_open_hour: str = "07:00"
    booking_close_hour: str = "21:00"
    booking_min_duration_minutes: int = 30
    booking_max_duration_hours: int = 8
    booking_max_advance_days: int = 90
    booking_cancellation_limit_hours: int = 2

    log_level: str = "INFO"
    upload_dir: str = "uploads"
    room_image_upload_subdir: str = "rooms"
    max_upload_size_bytes: int = 5 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def frontend_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    @property
    def uploads_root_path(self) -> Path:
        return Path(self.upload_dir)

    @property
    def room_upload_path(self) -> Path:
        return self.uploads_root_path / self.room_image_upload_subdir

    @property
    def room_upload_url_prefix(self) -> str:
        return f"/{self.upload_dir.strip('/')}/{self.room_image_upload_subdir.strip('/')}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
