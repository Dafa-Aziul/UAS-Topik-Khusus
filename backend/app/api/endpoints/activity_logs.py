from fastapi import APIRouter, Depends, Query

from app.api.dependencies import require_role
from app.schemas.activity_log import ActivityLogListResponse
from app.services.activity_log_service import ActivityLogService


router = APIRouter()
activity_log_service = ActivityLogService()


@router.get("", response_model=ActivityLogListResponse, response_model_by_alias=False)
async def list_activity_logs(
    actor_id: str | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: dict = Depends(require_role("ADMIN")),
) -> ActivityLogListResponse:
    items, meta = await activity_log_service.list_logs(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        page=page,
        limit=limit,
    )
    return ActivityLogListResponse(
        message="Log aktivitas berhasil diambil",
        data=items,
        meta=meta,
    )
