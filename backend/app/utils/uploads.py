from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import AppError


ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _safe_stem(filename: str | None) -> str:
    if not filename:
        return "room"

    stem = Path(filename).stem.lower()
    cleaned = "".join(char if char.isalnum() else "-" for char in stem).strip("-")
    return cleaned or "room"


async def save_room_image(image_file: UploadFile) -> str:
    settings = get_settings()

    if image_file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise AppError(
            "Format file gambar tidak didukung",
            "UNSUPPORTED_IMAGE_TYPE",
            status_code=422,
        )

    content = await image_file.read()
    if not content:
        raise AppError("File gambar kosong", "EMPTY_IMAGE_FILE", status_code=422)

    if len(content) > settings.max_upload_size_bytes:
        raise AppError(
            "Ukuran file gambar melebihi batas maksimum 5 MB",
            "IMAGE_TOO_LARGE",
            status_code=413,
        )

    settings.room_upload_path.mkdir(parents=True, exist_ok=True)
    extension = ALLOWED_IMAGE_CONTENT_TYPES[image_file.content_type]
    filename = f"{_safe_stem(image_file.filename)}-{uuid4().hex}{extension}"
    file_path = settings.room_upload_path / filename
    file_path.write_bytes(content)
    return f"{settings.room_upload_url_prefix}/{filename}"


def delete_room_image(image_url: str | None) -> None:
    if not image_url:
        return

    settings = get_settings()
    prefix = f"{settings.room_upload_url_prefix}/"
    if not image_url.startswith(prefix):
        return

    file_name = image_url.removeprefix(prefix)
    file_path = settings.room_upload_path / file_name
    if file_path.exists():
        os.remove(file_path)
