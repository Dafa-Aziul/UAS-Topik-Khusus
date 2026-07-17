from datetime import date
import json

from fastapi import APIRouter, Depends, Query, Request, UploadFile
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.api.dependencies import require_role
from app.core.exceptions import AppError
from app.schemas.activity_log import ActivityLogAction
from app.schemas.room import RoomAvailabilityResponse, RoomDetailResponse, RoomListResponse
from app.schemas.room import AdminRoomCreateRequest, AdminRoomResponse, AdminRoomStatusUpdateRequest, AdminRoomUpdateRequest
from app.schemas.common import ApiResponse
from app.services.activity_log_service import ActivityLogService
from app.services.room_service import RoomService
from app.utils.uploads import delete_room_image, save_room_image


router = APIRouter()
admin_router = APIRouter()
room_service = RoomService()
activity_log_service = ActivityLogService()


def _get_optional_text(form_data, key: str) -> str | None:
    value = form_data.get(key)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _get_required_text(form_data, key: str) -> str:
    value = _get_optional_text(form_data, key)
    if value is None:
        raise AppError(f"Field '{key}' wajib diisi", "VALIDATION_ERROR", status_code=422)
    return value


def _get_optional_int(form_data, key: str) -> int | None:
    value = _get_optional_text(form_data, key)
    if value is None:
        return None
    try:
        return int(value)
    except ValueError as exc:
        raise AppError(f"Field '{key}' harus berupa angka", "VALIDATION_ERROR", status_code=422) from exc


def _get_required_int(form_data, key: str) -> int:
    value = _get_optional_int(form_data, key)
    if value is None:
        raise AppError(f"Field '{key}' wajib diisi", "VALIDATION_ERROR", status_code=422)
    return value


def _get_optional_bool(form_data, key: str) -> bool:
    value = _get_optional_text(form_data, key)
    if value is None:
        return False
    return value.lower() in {"1", "true", "yes", "on"}


def _parse_facilities(form_data) -> list[str] | None:
    values = form_data.getlist("facilities")
    if not values:
        return None

    if len(values) == 1 and isinstance(values[0], str):
        raw = values[0].strip()
        if not raw:
            return []
        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise AppError("Field 'facilities' tidak valid", "VALIDATION_ERROR", status_code=422) from exc
            if not isinstance(parsed, list) or not all(isinstance(item, str) for item in parsed):
                raise AppError("Field 'facilities' harus berupa array string", "VALIDATION_ERROR", status_code=422)
            return parsed
        if "," in raw:
            return [item.strip() for item in raw.split(",") if item.strip()]

    return [str(item).strip() for item in values if str(item).strip()]


def _get_image_file(form_data) -> UploadFile | None:
    image_file = form_data.get("image_file")
    return image_file if isinstance(image_file, (UploadFile, StarletteUploadFile)) else None


def _build_create_payload(
    *,
    code: str,
    name: str,
    building: str,
    floor: int,
    location_description: str,
    capacity: int,
    facilities: list[str],
    description: str | None,
    image_url: str | None,
    status: str,
) -> AdminRoomCreateRequest:
    return AdminRoomCreateRequest(
        code=code,
        name=name,
        building=building,
        floor=floor,
        location_description=location_description,
        capacity=capacity,
        facilities=facilities,
        description=description,
        image_url=image_url,
        status=status,
    )


def _build_update_payload(
    *,
    name: str | None,
    building: str | None,
    floor: int | None,
    location_description: str | None,
    capacity: int | None,
    facilities: list[str] | None,
    description: str | None,
    image_url: str | None,
    status: str | None,
) -> AdminRoomUpdateRequest:
    return AdminRoomUpdateRequest(
        name=name,
        building=building,
        floor=floor,
        location_description=location_description,
        capacity=capacity,
        facilities=facilities,
        description=description,
        image_url=image_url,
        status=status,
    )


@router.get("", response_model=RoomListResponse)
async def list_rooms(
    search: str | None = None,
    building: str | None = None,
    status: str | None = None,
    min_capacity: int | None = Query(default=None, ge=1),
    facility: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    sort: str = "name",
) -> RoomListResponse:
    items, meta = await room_service.list_rooms(
        search=search,
        building=building,
        status=status,
        min_capacity=min_capacity,
        facility=facility,
        page=page,
        limit=limit,
        sort=sort,
    )
    return RoomListResponse(
        message="Data ruangan berhasil diambil",
        data=items,
        meta=meta,
    )


@router.get("/{room_id}", response_model=RoomDetailResponse)
async def get_room_detail(room_id: str) -> RoomDetailResponse:
    room = await room_service.get_room_detail(room_id)
    return RoomDetailResponse(
        message="Detail ruangan berhasil diambil",
        data=room,
    )


@router.get("/{room_id}/availability", response_model=RoomAvailabilityResponse)
async def get_room_availability(room_id: str, date: date) -> RoomAvailabilityResponse:
    availability = await room_service.get_room_availability(room_id, date)
    return RoomAvailabilityResponse(
        message="Ketersediaan ruangan berhasil diambil",
        data=availability,
    )


@admin_router.post("/rooms", response_model=AdminRoomResponse, status_code=201)
async def create_room(
    request: Request,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminRoomResponse:
    form_data = await request.form()
    code = _get_required_text(form_data, "code")
    name = _get_required_text(form_data, "name")
    building = _get_required_text(form_data, "building")
    floor = _get_required_int(form_data, "floor")
    location_description = _get_required_text(form_data, "location_description")
    capacity = _get_required_int(form_data, "capacity")
    facilities = _parse_facilities(form_data) or []
    description = _get_optional_text(form_data, "description")
    status = _get_optional_text(form_data, "status") or "AVAILABLE"
    image_file = _get_image_file(form_data)
    image_url = await save_room_image(image_file) if image_file is not None else None
    try:
        request = _build_create_payload(
            code=code,
            name=name,
            building=building,
            floor=floor,
            location_description=location_description,
            capacity=capacity,
            facilities=facilities or [],
            description=description,
            image_url=image_url,
            status=status,
        )
        room = await room_service.create_room(request, current_user["_id"])
    except Exception:
        delete_room_image(image_url)
        raise
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.ROOM_CREATED,
        entity_type="ROOM",
        entity_id=room.id,
        description="Admin membuat ruangan baru",
        metadata={"code": room.code, "name": room.name},
    )
    return AdminRoomResponse(message="Ruangan berhasil dibuat", data=room)


@admin_router.get("/rooms/{room_id}", response_model=AdminRoomResponse)
async def get_admin_room_detail(
    room_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminRoomResponse:
    room = await room_service.get_room_for_admin(room_id)
    return AdminRoomResponse(message="Detail ruangan admin berhasil diambil", data=room)


@admin_router.patch("/rooms/{room_id}", response_model=AdminRoomResponse)
async def update_room(
    room_id: str,
    request: Request,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminRoomResponse:
    form_data = await request.form()
    name = _get_optional_text(form_data, "name")
    building = _get_optional_text(form_data, "building")
    floor = _get_optional_int(form_data, "floor")
    location_description = _get_optional_text(form_data, "location_description")
    capacity = _get_optional_int(form_data, "capacity")
    facilities = _parse_facilities(form_data)
    description = _get_optional_text(form_data, "description")
    status = _get_optional_text(form_data, "status")
    remove_image = _get_optional_bool(form_data, "remove_image")
    image_file = _get_image_file(form_data)
    existing_room = await room_service.get_room_for_admin(room_id)
    previous_image_url = existing_room.image_url
    image_url = previous_image_url
    new_uploaded_image_url: str | None = None
    if image_file is not None:
        new_uploaded_image_url = await save_room_image(image_file)
        image_url = new_uploaded_image_url
    elif remove_image:
        image_url = None

    request = _build_update_payload(
        name=name,
        building=building,
        floor=floor,
        location_description=location_description,
        capacity=capacity,
        facilities=facilities,
        description=description,
        image_url=image_url if image_file is not None or remove_image else None,
        status=status,
    )
    try:
        room = await room_service.update_room(room_id, request, current_user["_id"])
    except Exception:
        delete_room_image(new_uploaded_image_url)
        raise

    if image_file is not None and previous_image_url != new_uploaded_image_url:
        delete_room_image(previous_image_url)
    elif remove_image:
        delete_room_image(previous_image_url)

    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.ROOM_UPDATED,
        entity_type="ROOM",
        entity_id=room.id,
        description="Admin mengubah data ruangan",
        metadata={"updated_fields": [key for key, value in request.model_dump().items() if value is not None]},
    )
    return AdminRoomResponse(message="Ruangan berhasil diubah", data=room)


@admin_router.patch("/rooms/{room_id}/status", response_model=AdminRoomResponse)
async def update_room_status(
    room_id: str,
    request: AdminRoomStatusUpdateRequest,
    current_user: dict = Depends(require_role("ADMIN")),
) -> AdminRoomResponse:
    room = await room_service.update_room_status(room_id, request.status, current_user["_id"])
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.ROOM_STATUS_UPDATED,
        entity_type="ROOM",
        entity_id=room.id,
        description="Admin mengubah status ruangan",
        metadata={"new_status": room.status},
    )
    return AdminRoomResponse(message="Status ruangan berhasil diubah", data=room)


@admin_router.delete("/rooms/{room_id}", response_model=ApiResponse)
async def delete_room(
    room_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
) -> ApiResponse:
    room = await room_service.get_room_for_admin(room_id)
    await room_service.delete_room(room_id, current_user["_id"])
    delete_room_image(room.image_url)
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.ROOM_DELETED,
        entity_type="ROOM",
        entity_id=room_id,
        description="Admin menonaktifkan ruangan",
    )
    return ApiResponse(message="Ruangan berhasil dinonaktifkan", data=None)
