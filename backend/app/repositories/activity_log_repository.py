from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4

from app.database.mongodb import get_mongodb_client


class ActivityLogRepository:
    collection_name = "activity_logs"
    _memory_store: dict[str, dict] = {}

    @classmethod
    def reset_memory_store(cls) -> None:
        cls._memory_store = {}

    async def create_log(self, payload: dict) -> dict:
        log = {
            "_id": payload.get("_id", str(uuid4())),
            **payload,
            "created_at": payload.get("created_at", datetime.now(timezone.utc)),
        }

        client = get_mongodb_client()
        if client is None:
            self._memory_store[log["_id"]] = log
            return deepcopy(log)

        settings_db = client.get_default_database()
        if settings_db is None:
            self._memory_store[log["_id"]] = log
            return deepcopy(log)

        await settings_db[self.collection_name].insert_one(log)
        return deepcopy(log)

    async def list_logs(self) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return [deepcopy(log) for log in self._memory_store.values()]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [deepcopy(log) for log in self._memory_store.values()]

        cursor = settings_db[self.collection_name].find({})
        return [log async for log in cursor]
