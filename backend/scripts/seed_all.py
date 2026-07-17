import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.seed_admin import seed_admin
from scripts.seed_rooms import seed_rooms
from scripts.seed_students_and_bookings import seed_students_and_bookings


async def seed_all() -> None:
    print("=== Seed admin ===")
    await seed_admin()
    print("=== Seed rooms ===")
    await seed_rooms()
    print("=== Seed students and bookings ===")
    await seed_students_and_bookings()
    print("=== All seeds completed ===")


def main() -> None:
    asyncio.run(seed_all())


if __name__ == "__main__":
    main()
