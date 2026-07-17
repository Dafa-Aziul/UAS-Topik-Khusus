import pytest

from app.core.security import hash_password
from app.repositories.booking_repository import BookingRepository
from app.repositories.user_repository import UserRepository


@pytest.fixture
async def admin_access_token(async_client):
    repository = UserRepository()
    await repository.create_user(
        name="Administrator",
        nim="-",
        email="admin@example.com",
        password_hash=hash_password("change-me"),
        role="ADMIN",
    )
    login_response = await async_client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "change-me"},
    )
    return login_response.json()["data"]["access_token"]


@pytest.fixture
async def student_access_token(async_client):
    await async_client.post(
        "/auth/register",
        json={
            "name": "Muhammad Dafa Aziul Ardi",
            "nim": "2311082027",
            "email": "2311082027@student.pnp.ac.id",
            "password": "Password123",
        },
    )
    login_response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "Password123"},
    )
    return login_response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_admin_dashboard_returns_summary(async_client, admin_access_token):
    repository = UserRepository()
    await repository.create_user(
        name="Mahasiswa Aktif",
        nim="2311082028",
        email="2311082028@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )

    response = await async_client.get(
        "/dashboards/admin",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_active_students"] >= 1
    assert data["total_rooms"] >= 2
    assert "PENDING" in data["booking_status_summary"]


@pytest.mark.asyncio
async def test_admin_booking_trend_returns_daily_counts(async_client, admin_access_token):
    response = await async_client.get(
        "/dashboards/admin/booking-trend",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"][0]["booking_date"] == "2026-07-20"


@pytest.mark.asyncio
async def test_admin_room_usage_returns_ranked_rooms(async_client, admin_access_token):
    response = await async_client.get(
        "/dashboards/admin/room-usage",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"][0]["room_id"] == "room-lab-01"


@pytest.mark.asyncio
async def test_student_dashboard_returns_personal_summary(async_client, student_access_token):
    await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {student_access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Belajar kelompok",
            "participant_count": 5,
            "start_at": "2026-07-21T09:00:00+07:00",
            "end_at": "2026-07-21T10:00:00+07:00",
            "user_note": None,
        },
    )

    response = await async_client.get(
        "/dashboards/me",
        headers={"Authorization": f"Bearer {student_access_token}"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_bookings"] >= 1
    assert data["pending_bookings"] >= 1


@pytest.mark.asyncio
async def test_non_admin_cannot_access_admin_dashboard(async_client, student_access_token):
    response = await async_client.get(
        "/dashboards/admin",
        headers={"Authorization": f"Bearer {student_access_token}"},
    )

    assert response.status_code == 403
