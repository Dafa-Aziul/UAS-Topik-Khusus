from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4

from app.database.mongodb import get_mongodb_client
from app.schemas.room import RoomStatus


def _sample_rooms() -> dict[str, dict]:
    now = datetime.now(timezone.utc)
    return {
        "room-lab-01": {
            "_id": "room-lab-01",
            "code": "LAB-01",
            "name": "Laboratorium Komputer 1",
            "building": "Gedung A",
            "floor": 2,
            "location_description": "Lantai 2, sebelah ruang server",
            "capacity": 30,
            "facilities": ["AC", "Proyektor", "Komputer"],
            "description": "Laboratorium untuk praktikum komputer",
            "image_url": None,
            "status": RoomStatus.AVAILABLE,
            "is_deleted": False,
            "created_by": "seed",
            "updated_by": "seed",
            "created_at": now,
            "updated_at": now,
        },
        "room-rkt-01": {
            "_id": "room-rkt-01",
            "code": "RKT-01",
            "name": "Ruang Kelas Teori 1",
            "building": "Gedung B",
            "floor": 1,
            "location_description": "Lantai 1, dekat lobby utama",
            "capacity": 40,
            "facilities": ["AC", "Whiteboard"],
            "description": "Ruang kelas teori umum",
            "image_url": None,
            "status": RoomStatus.MAINTENANCE,
            "is_deleted": False,
            "created_by": "seed",
            "updated_by": "seed",
            "created_at": now,
            "updated_at": now,
        },
        "room-rapat-01": {
            "_id": "room-rapat-01",
            "code": "RAPAT-01",
            "name": "Ruang Rapat Utama",
            "building": "Gedung C",
            "floor": 3,
            "location_description": "Lantai 3, sebelah ruang pimpinan",
            "capacity": 20,
            "facilities": ["AC", "Proyektor", "Speakerphone"],
            "description": "Ruang rapat utama kampus",
            "image_url": None,
            "status": RoomStatus.INACTIVE,
            "is_deleted": False,
            "created_by": "seed",
            "updated_by": "seed",
            "created_at": now,
            "updated_at": now,
        },
    }


class RoomRepository:
    collection_name = "rooms"
    _memory_store: dict[str, dict] = _sample_rooms()

    @classmethod
    def reset_memory_store(cls) -> None:
        cls._memory_store = _sample_rooms()

    async def list_public_rooms(self) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return [
                deepcopy(room)
                for room in self._memory_store.values()
                if not room.get("is_deleted", False) and room["status"] != RoomStatus.INACTIVE
            ]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [
                deepcopy(room)
                for room in self._memory_store.values()
                if not room.get("is_deleted", False) and room["status"] != RoomStatus.INACTIVE
            ]
        cursor = settings_db[self.collection_name].find(
            {"is_deleted": False, "status": {"$ne": RoomStatus.INACTIVE}}
        )
        return [room async for room in cursor]

    async def list_all(self) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return [deepcopy(room) for room in self._memory_store.values() if not room.get("is_deleted", False)]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [deepcopy(room) for room in self._memory_store.values() if not room.get("is_deleted", False)]
        cursor = settings_db[self.collection_name].find({"is_deleted": False})
        return [room async for room in cursor]

    async def find_public_by_id(self, room_id: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False) or room["status"] == RoomStatus.INACTIVE:
                return None
            return deepcopy(room)

        settings_db = client.get_default_database()
        if settings_db is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False) or room["status"] == RoomStatus.INACTIVE:
                return None
            return deepcopy(room)
        return await settings_db[self.collection_name].find_one(
            {"_id": room_id, "is_deleted": False, "status": {"$ne": RoomStatus.INACTIVE}}
        )

    async def find_by_id(self, room_id: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False):
                return None
            return deepcopy(room)

        settings_db = client.get_default_database()
        if settings_db is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False):
                return None
            return deepcopy(room)
        return await settings_db[self.collection_name].find_one({"_id": room_id, "is_deleted": False})

    async def find_by_code(self, code: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            return next(
                (
                    deepcopy(room)
                    for room in self._memory_store.values()
                    if room["code"].lower() == code.lower() and not room.get("is_deleted", False)
                ),
                None,
            )

        settings_db = client.get_default_database()
        if settings_db is None:
            return next(
                (
                    deepcopy(room)
                    for room in self._memory_store.values()
                    if room["code"].lower() == code.lower() and not room.get("is_deleted", False)
                ),
                None,
            )
        return await settings_db[self.collection_name].find_one({"code": code, "is_deleted": False})

    async def create_room(self, payload: dict) -> dict:
        now = datetime.now(timezone.utc)
        room = {
            "_id": payload.get("_id", str(uuid4())),
            "code": payload["code"],
            "name": payload["name"],
            "building": payload["building"],
            "floor": payload["floor"],
            "location_description": payload["location_description"],
            "capacity": payload["capacity"],
            "facilities": payload.get("facilities", []),
            "description": payload.get("description"),
            "image_url": payload.get("image_url"),
            "status": payload.get("status", RoomStatus.AVAILABLE),
            "is_deleted": False,
            "created_by": payload["actor_id"],
            "updated_by": payload["actor_id"],
            "created_at": now,
            "updated_at": now,
        }
        client = get_mongodb_client()
        if client is None:
            self._memory_store[room["_id"]] = room
            return deepcopy(room)

        settings_db = client.get_default_database()
        if settings_db is None:
            self._memory_store[room["_id"]] = room
            return deepcopy(room)

        await settings_db[self.collection_name].insert_one(room)
        return room

    async def update_room(self, room_id: str, updates: dict, actor_id: str) -> dict | None:
        now = datetime.now(timezone.utc)
        updates = {**updates, "updated_by": actor_id, "updated_at": now}
        client = get_mongodb_client()
        if client is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False):
                return None
            room.update(updates)
            return deepcopy(room)

        settings_db = client.get_default_database()
        if settings_db is None:
            room = self._memory_store.get(room_id)
            if room is None or room.get("is_deleted", False):
                return None
            room.update(updates)
            return deepcopy(room)

        await settings_db[self.collection_name].update_one({"_id": room_id}, {"$set": updates})
        return await settings_db[self.collection_name].find_one({"_id": room_id, "is_deleted": False})

    async def soft_delete_room(self, room_id: str, actor_id: str) -> dict | None:
        return await self.update_room(
            room_id,
            {"is_deleted": True, "status": RoomStatus.INACTIVE},
            actor_id,
        )
