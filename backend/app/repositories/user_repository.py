from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.database.mongodb import get_mongodb_client
from app.schemas.user import UserDocument


class UserRepository:
    collection_name = "users"
    _memory_store: dict[str, dict] = {}

    async def find_by_nim(self, nim: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            return next((user for user in self._memory_store.values() if user["nim"] == nim), None)

        settings_db = client.get_default_database()
        if settings_db is None:
            return next((user for user in self._memory_store.values() if user["nim"] == nim), None)
        return await settings_db[self.collection_name].find_one({"nim": nim})

    async def find_by_email(self, email: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            return next((user for user in self._memory_store.values() if user["email"] == email), None)

        settings_db = client.get_default_database()
        if settings_db is None:
            return next((user for user in self._memory_store.values() if user["email"] == email), None)
        return await settings_db[self.collection_name].find_one({"email": email})

    async def find_by_id(self, user_id: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            return self._memory_store.get(user_id)

        settings_db = client.get_default_database()
        if settings_db is None:
            return self._memory_store.get(user_id)
        return await settings_db[self.collection_name].find_one({"_id": user_id})

    async def list_all(self) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return list(self._memory_store.values())

        settings_db = client.get_default_database()
        if settings_db is None:
            return list(self._memory_store.values())
        cursor = settings_db[self.collection_name].find({})
        return [user async for user in cursor]

    async def create_user(self, *, name: str, nim: str, email: str, password_hash: str, role: str) -> dict:
        now = datetime.now(timezone.utc)
        user = UserDocument(
            _id=str(uuid4()),
            name=name,
            nim=nim,
            email=email,
            password_hash=password_hash,
            role=role,
            is_active=True,
            created_at=now,
            updated_at=now,
        ).model_dump(by_alias=True)

        client = get_mongodb_client()
        if client is None:
            self._memory_store[user["_id"]] = user
            return user

        settings_db = client.get_default_database()
        if settings_db is None:
            self._memory_store[user["_id"]] = user
            return user

        await settings_db[self.collection_name].insert_one(user)
        return user

    async def update_password(self, user_id: str, password_hash: str) -> dict | None:
        client = get_mongodb_client()
        now = datetime.now(timezone.utc)

        if client is None:
            user = self._memory_store.get(user_id)
            if user is None:
                return None
            user["password_hash"] = password_hash
            user["updated_at"] = now
            return user

        settings_db = client.get_default_database()
        if settings_db is None:
            user = self._memory_store.get(user_id)
            if user is None:
                return None
            user["password_hash"] = password_hash
            user["updated_at"] = now
            return user

        await settings_db[self.collection_name].update_one(
            {"_id": user_id},
            {"$set": {"password_hash": password_hash, "updated_at": now}},
        )
        return await settings_db[self.collection_name].find_one({"_id": user_id})
