import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.security import hash_password
from app.database.mongodb import close_mongodb, connect_mongodb, mongodb_is_connected
from app.repositories.booking_repository import BookingRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository
from app.schemas.booking import BookingStatus


STUDENT_SEEDS = [
    {
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "password": "Password123",
    },
    {
        "name": "Nabila Azzahra",
        "nim": "2311082028",
        "email": "2311082028@student.pnp.ac.id",
        "password": "Password123",
    },
    {
        "name": "Rizky Aditya Putra",
        "nim": "2311082029",
        "email": "2311082029@student.pnp.ac.id",
        "password": "Password123",
    },
    {
        "name": "Salsa Nur Fadila",
        "nim": "2311082030",
        "email": "2311082030@student.pnp.ac.id",
        "password": "Password123",
    },
    {
        "name": "Fikri Ramadhan",
        "nim": "2311082031",
        "email": "2311082031@student.pnp.ac.id",
        "password": "Password123",
    },
]


BOOKING_SEEDS = [
    {
        "booking_code": "BKG-20260720-E301-01",
        "user_email": "2311082027@student.pnp.ac.id",
        "room_code": "E301",
        "purpose": "Praktikum pemrograman web lanjutan",
        "participant_count": 24,
        "booking_date": "2026-07-20",
        "start_at": "2026-07-20T08:00:00+07:00",
        "end_at": "2026-07-20T10:00:00+07:00",
        "status": BookingStatus.APPROVED,
        "user_note": "Membutuhkan koneksi internet stabil untuk demo aplikasi.",
        "admin_note": "Disetujui untuk kegiatan praktikum terjadwal.",
        "reviewed_by_email": "admin@example.com",
        "reviewed_at": "2026-07-17T09:00:00+07:00",
    },
    {
        "booking_code": "BKG-20260721-E302-02",
        "user_email": "2311082028@student.pnp.ac.id",
        "room_code": "E302",
        "purpose": "Workshop mobile development himpunan",
        "participant_count": 20,
        "booking_date": "2026-07-21",
        "start_at": "2026-07-21T13:00:00+07:00",
        "end_at": "2026-07-21T15:00:00+07:00",
        "status": BookingStatus.PENDING,
        "user_note": "Perlu akses proyektor dan speaker untuk presentasi.",
    },
    {
        "booking_code": "BKG-20260722-E310-03",
        "user_email": "2311082029@student.pnp.ac.id",
        "room_code": "E310",
        "purpose": "Pelatihan desain UI dasar",
        "participant_count": 18,
        "booking_date": "2026-07-22",
        "start_at": "2026-07-22T09:00:00+07:00",
        "end_at": "2026-07-22T11:00:00+07:00",
        "status": BookingStatus.REJECTED,
        "user_note": "Menggunakan software desain yang sudah tersedia di lab.",
        "admin_note": "Ditolak karena jadwal bentrok dengan agenda jurusan.",
        "reviewed_by_email": "admin@example.com",
        "reviewed_at": "2026-07-18T10:00:00+07:00",
    },
    {
        "booking_code": "BKG-20260723-E204-04",
        "user_email": "2311082030@student.pnp.ac.id",
        "room_code": "E204",
        "purpose": "Sesi praktikum machine learning terapan",
        "participant_count": 16,
        "booking_date": "2026-07-23",
        "start_at": "2026-07-23T10:00:00+07:00",
        "end_at": "2026-07-23T12:00:00+07:00",
        "status": BookingStatus.CANCELLED,
        "user_note": "Membutuhkan GPU workstation untuk demo model.",
        "cancelled_by_email": "2311082030@student.pnp.ac.id",
        "cancelled_at": "2026-07-19T08:30:00+07:00",
    },
    {
        "booking_code": "BKG-20260724-A402-05",
        "user_email": "2311082031@student.pnp.ac.id",
        "room_code": "A402",
        "purpose": "Seminar mini persiapan capstone project",
        "participant_count": 30,
        "booking_date": "2026-07-24",
        "start_at": "2026-07-24T14:00:00+07:00",
        "end_at": "2026-07-24T16:00:00+07:00",
        "status": BookingStatus.COMPLETED,
        "user_note": "Perlu susunan kursi model seminar.",
        "admin_note": "Disetujui dan kegiatan telah selesai dengan baik.",
        "reviewed_by_email": "admin@example.com",
        "reviewed_at": "2026-07-18T14:00:00+07:00",
        "completed_by_email": "admin@example.com",
        "completed_at": "2026-07-24T16:15:00+07:00",
    },
]


def _utc_from_iso(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value).astimezone(timezone.utc)


async def seed_students_and_bookings() -> None:
    await connect_mongodb()
    if not mongodb_is_connected():
        raise RuntimeError(
            "MongoDB is not connected. Seed students and bookings requires a live database connection."
        )

    user_repository = UserRepository()
    room_repository = RoomRepository()
    booking_repository = BookingRepository()

    try:
        users_by_email: dict[str, dict] = {}
        for student in STUDENT_SEEDS:
            existing = await user_repository.find_by_email(student["email"])
            if existing is None:
                existing = await user_repository.create_user(
                    name=student["name"],
                    nim=student["nim"],
                    email=student["email"],
                    password_hash=hash_password(student["password"]),
                    role="MAHASISWA",
                )
                print(f"Inserted student {student['nim']} - {student['name']}")
            else:
                print(f"Skip student {student['nim']} - already exists.")
            users_by_email[student["email"]] = existing

        admin_user = await user_repository.find_by_email("admin@example.com")
        if admin_user is None:
            raise RuntimeError("Admin user not found. Run scripts/seed_admin.py first.")
        users_by_email["admin@example.com"] = admin_user

        rooms_by_code: dict[str, dict] = {}
        for booking in BOOKING_SEEDS:
            room = await room_repository.find_by_code(booking["room_code"])
            if room is None:
                raise RuntimeError(
                    f"Room {booking['room_code']} not found. Run scripts/seed_rooms.py first."
                )
            rooms_by_code[booking["room_code"]] = room

        existing_bookings = await booking_repository.list_all()
        existing_codes = {booking["booking_code"] for booking in existing_bookings}

        inserted = 0
        for booking in BOOKING_SEEDS:
            if booking["booking_code"] in existing_codes:
                print(f"Skip booking {booking['booking_code']} - already exists.")
                continue

            user = users_by_email[booking["user_email"]]
            room = rooms_by_code[booking["room_code"]]
            reviewed_by = (
                users_by_email[booking["reviewed_by_email"]]["_id"]
                if booking.get("reviewed_by_email")
                else None
            )
            cancelled_by = (
                users_by_email[booking["cancelled_by_email"]]["_id"]
                if booking.get("cancelled_by_email")
                else None
            )
            completed_by = (
                users_by_email[booking["completed_by_email"]]["_id"]
                if booking.get("completed_by_email")
                else None
            )

            await booking_repository.create_booking(
                {
                    "booking_code": booking["booking_code"],
                    "user_id": user["_id"],
                    "room_id": room["_id"],
                    "purpose": booking["purpose"],
                    "participant_count": booking["participant_count"],
                    "booking_date": booking["booking_date"],
                    "start_at": booking["start_at"],
                    "end_at": booking["end_at"],
                    "status": booking["status"],
                    "user_note": booking.get("user_note"),
                    "admin_note": booking.get("admin_note"),
                    "reviewed_by": reviewed_by,
                    "reviewed_at": booking.get("reviewed_at"),
                    "cancelled_by": cancelled_by,
                    "cancelled_at": booking.get("cancelled_at"),
                    "completed_by": completed_by,
                    "completed_at": booking.get("completed_at"),
                    "created_at": _utc_from_iso(f"{booking['booking_date']}T00:00:00+07:00"),
                    "updated_at": _utc_from_iso(
                        booking.get("completed_at")
                        or booking.get("cancelled_at")
                        or booking.get("reviewed_at")
                        or f"{booking['booking_date']}T00:00:00+07:00"
                    ),
                }
            )
            inserted += 1
            print(f"Inserted booking {booking['booking_code']} for {booking['user_email']}")

        print(
            f"Student and booking seed completed. Inserted {len(STUDENT_SEEDS)} students checked, {inserted} new bookings."
        )
    finally:
        await close_mongodb()


def main() -> None:
    asyncio.run(seed_students_and_bookings())


if __name__ == "__main__":
    main()
