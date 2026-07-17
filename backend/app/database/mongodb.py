from pymongo import AsyncMongoClient
from pymongo.errors import PyMongoError

from app.core.config import get_settings


client: AsyncMongoClient | None = None


async def connect_mongodb() -> None:
    global client

    settings = get_settings()
    try:
        client = AsyncMongoClient(settings.mongodb_uri)
        await client.admin.command("ping")
    except PyMongoError:
        client = None


async def close_mongodb() -> None:
    global client

    if client is not None:
        await client.close()
        client = None


def get_mongodb_client() -> AsyncMongoClient | None:
    return client


def mongodb_is_connected() -> bool:
    return client is not None

