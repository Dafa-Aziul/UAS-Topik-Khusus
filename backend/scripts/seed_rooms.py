import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database.mongodb import close_mongodb, connect_mongodb, mongodb_is_connected
from app.repositories.room_repository import RoomRepository
from app.schemas.room import RoomStatus


ROOM_SEEDS = [
    {
        "code": "E301",
        "name": "Labor Pemrograman 1",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E301 - Labor Pemrograman 1",
        "capacity": 32,
        "facilities": ["AC", "Komputer", "Proyektor", "Internet"],
        "description": "Laboratorium pemrograman untuk praktikum web, basis data, dan cloud.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E302",
        "name": "Labor Pemrograman 2",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E302 - Labor Pemrograman 2",
        "capacity": 32,
        "facilities": ["AC", "Komputer", "Proyektor", "Internet"],
        "description": "Laboratorium pemrograman untuk praktikum mobile dan pemrograman berorientasi objek.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E306",
        "name": "Labor Jaringan 2",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E306 - Labor Jaringan 2",
        "capacity": 28,
        "facilities": ["AC", "Switch", "Router", "Proyektor"],
        "description": "Laboratorium jaringan untuk praktikum sistem operasi dan komunikasi data.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E308",
        "name": "Labor Jaringan 1",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E308 - Labor Jaringan 1",
        "capacity": 28,
        "facilities": ["AC", "Switch", "Router", "Whiteboard"],
        "description": "Laboratorium jaringan untuk praktikum basis data dan komputasi awan.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E310",
        "name": "Labor Multimedia",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E310 - Labor Multimedia",
        "capacity": 24,
        "facilities": ["AC", "Komputer", "Proyektor", "Speaker"],
        "description": "Laboratorium multimedia untuk praktikum desain, multimedia, dan presentasi digital.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E311",
        "name": "Labor Sistem Informasi",
        "building": "Gedung E",
        "floor": 3,
        "location_description": "E311 - Labor Sistem Informasi",
        "capacity": 30,
        "facilities": ["AC", "Komputer", "Proyektor", "Internet"],
        "description": "Laboratorium sistem informasi untuk praktikum framework, keamanan, dan analisis perangkat lunak.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E202",
        "name": "Labor Perakitan dan Instalasi",
        "building": "Gedung E",
        "floor": 2,
        "location_description": "E202 - Labor Perakitan dan Instalasi",
        "capacity": 24,
        "facilities": ["AC", "Toolkit", "Komputer", "Proyektor"],
        "description": "Laboratorium untuk praktikum perakitan, instalasi, dan capstone berbasis perangkat keras.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E204",
        "name": "Labor Artificial Intelligence",
        "building": "Gedung E",
        "floor": 2,
        "location_description": "E204 - Labor Artificial Intelligence",
        "capacity": 24,
        "facilities": ["AC", "Komputer", "GPU Workstation", "Proyektor"],
        "description": "Laboratorium AI untuk praktikum kecerdasan buatan dan machine learning.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "E208",
        "name": "Labor Sistem Informasi 2",
        "building": "Gedung E",
        "floor": 2,
        "location_description": "E208 - Labor Sistem Informasi 2",
        "capacity": 26,
        "facilities": ["AC", "Komputer", "Proyektor", "Whiteboard"],
        "description": "Laboratorium sistem informasi lanjutan untuk capstone, warehouse data, dan keamanan perangkat lunak.",
        "status": RoomStatus.AVAILABLE,
    },
    {
        "code": "A402",
        "name": "Labor Komputer A402",
        "building": "Gedung A",
        "floor": 4,
        "location_description": "A402 - Labor Komputer",
        "capacity": 36,
        "facilities": ["AC", "Komputer", "Proyektor", "Internet"],
        "description": "Labor komputer umum untuk praktikum proyek perangkat lunak dan kelas komputer reguler.",
        "status": RoomStatus.AVAILABLE,
    },
]


async def seed_rooms() -> None:
    await connect_mongodb()
    if not mongodb_is_connected():
        raise RuntimeError("MongoDB is not connected. Seed rooms requires a live database connection.")

    repository = RoomRepository()
    inserted = 0

    try:
        for room in ROOM_SEEDS:
            existing = await repository.find_by_code(room["code"])
            if existing is not None:
                print(f"Skip {room['code']} - already exists.")
                continue

            await repository.create_room({**room, "actor_id": "seed-rooms"})
            inserted += 1
            print(f"Inserted {room['code']} - {room['name']}")
    finally:
        await close_mongodb()

    print(f"Room seed completed. Inserted {inserted} new rooms.")


def main() -> None:
    asyncio.run(seed_rooms())


if __name__ == "__main__":
    main()
