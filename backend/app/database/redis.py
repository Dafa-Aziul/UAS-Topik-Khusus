from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings


client: Redis | None = None


async def connect_redis() -> None:
    global client

    settings = get_settings()
    if not settings.redis_enabled:
        client = None
        return

    try:
        client = Redis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
    except RedisError:
        client = None


async def close_redis() -> None:
    global client

    if client is not None:
        await client.aclose()
        client = None


def get_redis_client() -> Redis | None:
    return client


def redis_is_connected() -> bool:
    settings = get_settings()
    return client is not None if settings.redis_enabled else False

