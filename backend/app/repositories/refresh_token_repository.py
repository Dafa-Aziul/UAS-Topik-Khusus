from __future__ import annotations

from datetime import datetime, timezone

from app.database.mongodb import get_mongodb_client


class RefreshTokenRepository:
    collection_name = "refresh_tokens"
    _memory_store: dict[str, dict] = {}

    async def save_token(self, *, jti: str, user_id: str, token_hash: str, expires_at: datetime) -> dict:
        record = {
            "_id": jti,
            "user_id": user_id,
            "token_hash": token_hash,
            "expires_at": expires_at,
            "revoked_at": None,
            "created_at": datetime.now(timezone.utc),
        }
        client = get_mongodb_client()
        if client is None:
            self._memory_store[jti] = record
            return record

        settings_db = client.get_default_database()
        if settings_db is None:
            self._memory_store[jti] = record
            return record

        await settings_db[self.collection_name].insert_one(record)
        return record

    async def find_by_jti(self, jti: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            return self._memory_store.get(jti)

        settings_db = client.get_default_database()
        if settings_db is None:
            return self._memory_store.get(jti)
        return await settings_db[self.collection_name].find_one({"_id": jti})

    async def revoke_token(self, jti: str) -> None:
        client = get_mongodb_client()
        revoked_at = datetime.now(timezone.utc)
        if client is None:
            token = self._memory_store.get(jti)
            if token is not None:
                token["revoked_at"] = revoked_at
            return

        settings_db = client.get_default_database()
        if settings_db is None:
            token = self._memory_store.get(jti)
            if token is not None:
                token["revoked_at"] = revoked_at
            return

        await settings_db[self.collection_name].update_one(
            {"_id": jti},
            {"$set": {"revoked_at": revoked_at}},
        )
