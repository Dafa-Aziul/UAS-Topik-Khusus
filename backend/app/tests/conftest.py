from collections.abc import AsyncIterator
from shutil import rmtree

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.main import app
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.booking_repository import BookingRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository


@pytest_asyncio.fixture(autouse=True)
async def reset_in_memory_state():
    settings = get_settings()
    if settings.uploads_root_path.exists():
        rmtree(settings.uploads_root_path)
    settings.uploads_root_path.mkdir(parents=True, exist_ok=True)
    UserRepository._memory_store.clear()
    RefreshTokenRepository._memory_store.clear()
    RoomRepository.reset_memory_store()
    BookingRepository.reset_memory_store()
    ActivityLogRepository.reset_memory_store()
    yield
    if settings.uploads_root_path.exists():
        rmtree(settings.uploads_root_path)
    settings.uploads_root_path.mkdir(parents=True, exist_ok=True)
    UserRepository._memory_store.clear()
    RefreshTokenRepository._memory_store.clear()
    RoomRepository.reset_memory_store()
    BookingRepository.reset_memory_store()
    ActivityLogRepository.reset_memory_store()


@pytest_asyncio.fixture
async def async_client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
