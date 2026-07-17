from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database.mongodb import close_mongodb, connect_mongodb
from app.database.redis import close_redis, connect_redis


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_mongodb()
    await connect_redis()
    yield
    await close_redis()
    await close_mongodb()

