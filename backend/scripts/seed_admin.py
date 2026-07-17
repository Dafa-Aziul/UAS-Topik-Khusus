import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database.mongodb import close_mongodb, connect_mongodb, mongodb_is_connected
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


async def seed_admin() -> None:
    await connect_mongodb()
    if not mongodb_is_connected():
        raise RuntimeError("MongoDB is not connected. Seed admin requires a live database connection.")

    repository = UserRepository()
    email = "admin@example.com"
    try:
        existing = await repository.find_by_email(email)
        if existing is not None:
            print("Admin already seeded in MongoDB.")
            return

        await repository.create_user(
            name="Administrator",
            nim="-",
            email=email,
            password_hash=hash_password("change-me"),
            role="ADMIN",
        )
        print("Admin seeded in MongoDB with email admin@example.com")
    finally:
        await close_mongodb()


def main() -> None:
    asyncio.run(seed_admin())


if __name__ == "__main__":
    main()
