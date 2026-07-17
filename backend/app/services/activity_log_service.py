from __future__ import annotations

from math import ceil
from typing import Any

from app.repositories.activity_log_repository import ActivityLogRepository
from app.schemas.activity_log import ActivityLogData
from app.schemas.common import PaginationMeta


class ActivityLogService:
    def __init__(self, repository: ActivityLogRepository | None = None):
        self.repository = repository or ActivityLogRepository()

    async def record(
        self,
        *,
        actor_id: str,
        actor_role: str,
        action: str,
        entity_type: str,
        entity_id: str,
        description: str,
        metadata: dict[str, Any] | None = None,
        ip_address: str | None = None,
        request_id: str | None = None,
    ) -> ActivityLogData:
        log = await self.repository.create_log(
            {
                "actor_id": actor_id,
                "actor_role": actor_role,
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "description": description,
                "metadata": metadata or {},
                "ip_address": ip_address,
                "request_id": request_id,
            }
        )
        return ActivityLogData.model_validate(log)

    async def list_logs(
        self,
        *,
        actor_id: str | None,
        action: str | None,
        entity_type: str | None,
        entity_id: str | None,
        page: int,
        limit: int,
    ) -> tuple[list[ActivityLogData], PaginationMeta]:
        logs = await self.repository.list_logs()
        if actor_id:
            logs = [log for log in logs if log["actor_id"] == actor_id]
        if action:
            logs = [log for log in logs if log["action"] == action]
        if entity_type:
            logs = [log for log in logs if log["entity_type"] == entity_type]
        if entity_id:
            logs = [log for log in logs if log["entity_id"] == entity_id]

        logs.sort(key=lambda log: log["created_at"], reverse=True)
        total_items = len(logs)
        start = (page - 1) * limit
        end = start + limit
        items = [ActivityLogData.model_validate(log) for log in logs[start:end]]
        total_pages = max(1, ceil(total_items / limit)) if limit > 0 else 1
        meta = PaginationMeta(
            page=page,
            limit=limit,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
        )
        return items, meta
