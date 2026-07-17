import pytest

from app.core.security import hash_password
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
async def test_admin_can_view_activity_logs(async_client, admin_access_token):
    response = await async_client.get(
        "/activity-logs",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["meta"]["total_items"] >= 1


@pytest.mark.asyncio
async def test_booking_action_creates_activity_log(async_client, admin_access_token):
    response = await async_client.patch(
        "/admin/bookings/booking-pending-1/approve",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        json={"admin_note": "Disetujui untuk kegiatan akademik"},
    )
    assert response.status_code == 200

    log_response = await async_client.get(
        "/activity-logs?action=BOOKING_APPROVED",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert log_response.status_code == 200
    data = log_response.json()["data"]
    assert any(item["entity_id"] == "booking-pending-1" for item in data)


@pytest.mark.asyncio
async def test_non_admin_cannot_view_activity_logs(async_client, student_access_token):
    response = await async_client.get(
        "/activity-logs",
        headers={"Authorization": f"Bearer {student_access_token}"},
    )

    assert response.status_code == 403
