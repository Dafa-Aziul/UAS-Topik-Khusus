from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime, timezone
from uuid import uuid4

from app.database.mongodb import get_mongodb_client
from app.schemas.booking import BookingStatus


class BookingRepository:
    collection_name = "bookings"
    _memory_store: dict[str, dict] = {
        "booking-approved-1": {
            "_id": "booking-approved-1",
            "booking_code": "BKG-20260710-CD34",
            "user_id": "seed-user-1",
            "room_id": "room-lab-01",
            "purpose": "Praktikum jaringan",
            "participant_count": 20,
            "booking_date": "2026-07-20",
            "start_at": "2026-07-20T09:00:00+07:00",
            "end_at": "2026-07-20T11:00:00+07:00",
            "status": BookingStatus.APPROVED,
            "user_note": None,
            "admin_note": None,
            "reviewed_by": "seed-admin-1",
            "reviewed_at": "2026-07-10T08:00:00+07:00",
            "cancelled_by": None,
            "cancelled_at": None,
            "completed_by": None,
            "completed_at": None,
            "created_at": datetime(2026, 7, 10, 1, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 7, 10, 1, 0, tzinfo=timezone.utc),
        },
        "booking-pending-1": {
            "_id": "booking-pending-1",
            "booking_code": "BKG-20260715-AB12",
            "user_id": "seed-user-2",
            "room_id": "room-lab-01",
            "purpose": "Diskusi capstone",
            "participant_count": 10,
            "booking_date": "2026-07-20",
            "start_at": "2026-07-20T13:00:00+07:00",
            "end_at": "2026-07-20T15:00:00+07:00",
            "status": BookingStatus.PENDING,
            "user_note": None,
            "admin_note": None,
            "reviewed_by": None,
            "reviewed_at": None,
            "cancelled_by": None,
            "cancelled_at": None,
            "completed_by": None,
            "completed_at": None,
            "created_at": datetime(2026, 7, 15, 2, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 7, 15, 2, 0, tzinfo=timezone.utc),
        },
    }

    @classmethod
    def reset_memory_store(cls) -> None:
        cls._memory_store = {
            "booking-approved-1": {
                "_id": "booking-approved-1",
                "booking_code": "BKG-20260710-CD34",
                "user_id": "seed-user-1",
                "room_id": "room-lab-01",
                "purpose": "Praktikum jaringan",
                "participant_count": 20,
                "booking_date": "2026-07-20",
                "start_at": "2026-07-20T09:00:00+07:00",
                "end_at": "2026-07-20T11:00:00+07:00",
                "status": BookingStatus.APPROVED,
                "user_note": None,
                "admin_note": None,
                "reviewed_by": "seed-admin-1",
                "reviewed_at": "2026-07-10T08:00:00+07:00",
                "cancelled_by": None,
                "cancelled_at": None,
                "completed_by": None,
                "completed_at": None,
                "created_at": datetime(2026, 7, 10, 1, 0, tzinfo=timezone.utc),
                "updated_at": datetime(2026, 7, 10, 1, 0, tzinfo=timezone.utc),
            },
            "booking-pending-1": {
                "_id": "booking-pending-1",
                "booking_code": "BKG-20260715-AB12",
                "user_id": "seed-user-2",
                "room_id": "room-lab-01",
                "purpose": "Diskusi capstone",
                "participant_count": 10,
                "booking_date": "2026-07-20",
                "start_at": "2026-07-20T13:00:00+07:00",
                "end_at": "2026-07-20T15:00:00+07:00",
                "status": BookingStatus.PENDING,
                "user_note": None,
                "admin_note": None,
                "reviewed_by": None,
                "reviewed_at": None,
                "cancelled_by": None,
                "cancelled_at": None,
                "completed_by": None,
                "completed_at": None,
                "created_at": datetime(2026, 7, 15, 2, 0, tzinfo=timezone.utc),
                "updated_at": datetime(2026, 7, 15, 2, 0, tzinfo=timezone.utc),
            },
        }

    async def find_approved_by_room_and_date(self, room_id: str, booking_day: date) -> list[dict]:
        booking_day_str = booking_day.isoformat()
        client = get_mongodb_client()
        if client is None:
            return [
                deepcopy(booking)
                for booking in self._memory_store.values()
                if booking["room_id"] == room_id
                and booking["booking_date"] == booking_day_str
                and booking["status"] == BookingStatus.APPROVED
            ]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [
                deepcopy(booking)
                for booking in self._memory_store.values()
                if booking["room_id"] == room_id
                and booking["booking_date"] == booking_day_str
                and booking["status"] == BookingStatus.APPROVED
            ]
        cursor = settings_db[self.collection_name].find(
            {"room_id": room_id, "booking_date": booking_day_str, "status": BookingStatus.APPROVED}
        )
        return [booking async for booking in cursor]

    async def create_booking(self, payload: dict) -> dict:
        booking = {
            "_id": payload.get("_id", str(uuid4())),
            **payload,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        client = get_mongodb_client()
        if client is None:
            self._memory_store[booking["_id"]] = booking
            return deepcopy(booking)

        settings_db = client.get_default_database()
        if settings_db is None:
            self._memory_store[booking["_id"]] = booking
            return deepcopy(booking)
        await settings_db[self.collection_name].insert_one(booking)
        return deepcopy(booking)

    async def list_by_user(self, user_id: str) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return [deepcopy(b) for b in self._memory_store.values() if b["user_id"] == user_id]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [deepcopy(b) for b in self._memory_store.values() if b["user_id"] == user_id]
        cursor = settings_db[self.collection_name].find({"user_id": user_id})
        return [booking async for booking in cursor]

    async def list_all(self) -> list[dict]:
        client = get_mongodb_client()
        if client is None:
            return [deepcopy(booking) for booking in self._memory_store.values()]

        settings_db = client.get_default_database()
        if settings_db is None:
            return [deepcopy(booking) for booking in self._memory_store.values()]
        cursor = settings_db[self.collection_name].find({})
        return [booking async for booking in cursor]

    async def find_by_id(self, booking_id: str) -> dict | None:
        client = get_mongodb_client()
        if client is None:
            booking = self._memory_store.get(booking_id)
            return deepcopy(booking) if booking else None

        settings_db = client.get_default_database()
        if settings_db is None:
            booking = self._memory_store.get(booking_id)
            return deepcopy(booking) if booking else None
        return await settings_db[self.collection_name].find_one({"_id": booking_id})

    async def update_booking(self, booking_id: str, updates: dict) -> dict | None:
        updates = {**updates, "updated_at": datetime.now(timezone.utc)}
        client = get_mongodb_client()
        if client is None:
            booking = self._memory_store.get(booking_id)
            if booking is None:
                return None
            booking.update(updates)
            return deepcopy(booking)

        settings_db = client.get_default_database()
        if settings_db is None:
            booking = self._memory_store.get(booking_id)
            if booking is None:
                return None
            booking.update(updates)
            return deepcopy(booking)
        await settings_db[self.collection_name].update_one({"_id": booking_id}, {"$set": updates})
        return await settings_db[self.collection_name].find_one({"_id": booking_id})
