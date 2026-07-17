from redis.asyncio import Redis

from app.database.redis import get_redis_client


def get_cache_client() -> Redis | None:
    return get_redis_client()

