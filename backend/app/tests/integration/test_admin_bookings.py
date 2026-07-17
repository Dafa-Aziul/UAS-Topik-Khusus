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


@pytest.mark.asyncio
async def test_admin_can_list_all_bookings(async_client, admin_access_token):
    repository = UserRepository()
    await repository.create_user(
        name="Mahasiswa Satu",
        nim="2311082001",
        email="mahasiswa1@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )
    await repository.create_user(
        name="Mahasiswa Dua",
        nim="2311082002",
        email="mahasiswa2@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )
    response = await async_client.get(
        "/admin/bookings",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["meta"]["total_items"] >= 2
    ids = [item["id"] for item in payload["data"]]
    assert "booking-approved-1" in ids
    assert "booking-pending-1" in ids
    assert any(item["room"]["id"] == "room-lab-01" for item in payload["data"])
    assert any(item["user"]["role"] == "MAHASISWA" for item in payload["data"])


@pytest.mark.asyncio
async def test_admin_can_get_booking_detail(async_client, admin_access_token):
    response = await async_client.get(
        "/admin/bookings/booking-pending-1",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["id"] == "booking-pending-1"


@pytest.mark.asyncio
async def test_admin_can_approve_pending_booking(async_client, admin_access_token):
    repository = UserRepository()
    await repository.create_user(
        name="Mahasiswa Pending",
        nim="2311082010",
        email="pending@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )
    response = await async_client.patch(
        "/admin/bookings/booking-pending-1/approve",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        json={"admin_note": "Disetujui untuk kegiatan akademik"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["status"] == "APPROVED"
    assert payload["admin_note"] == "Disetujui untuk kegiatan akademik"
    assert payload["reviewed_by"] is not None
    assert payload["reviewed_at"] is not None
    assert payload["room"]["id"] == "room-lab-01"


@pytest.mark.asyncio
async def test_admin_can_reject_pending_booking(async_client, admin_access_token):
    repository = UserRepository()
    created_user = await repository.create_user(
        name="Mahasiswa Reject",
        nim="2311082011",
        email="reject@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )
    repository = BookingRepository()
    created = await repository.create_booking(
        {
            "booking_code": "BKG-20260716-RJ01",
            "user_id": created_user["_id"],
            "room_id": "room-lab-01",
            "purpose": "Kegiatan bentrok internal",
            "participant_count": 5,
            "booking_date": "2026-07-22",
            "start_at": "2026-07-22T13:00:00+07:00",
            "end_at": "2026-07-22T15:00:00+07:00",
            "status": "PENDING",
            "user_note": None,
            "admin_note": None,
            "reviewed_by": None,
            "reviewed_at": None,
            "cancelled_by": None,
            "cancelled_at": None,
            "completed_by": None,
            "completed_at": None,
        }
    )

    response = await async_client.patch(
        f"/admin/bookings/{created['_id']}/reject",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        json={"admin_note": "Jadwal tidak bisa difasilitasi"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["status"] == "REJECTED"
    assert payload["admin_note"] == "Jadwal tidak bisa difasilitasi"
    assert payload["user"]["email"] == "reject@student.pnp.ac.id"


@pytest.mark.asyncio
async def test_admin_can_complete_approved_booking(async_client, admin_access_token):
    repository = UserRepository()
    await repository.create_user(
        name="Mahasiswa Approved",
        nim="2311082012",
        email="approved@student.pnp.ac.id",
        password_hash=hash_password("Password123"),
        role="MAHASISWA",
    )
    response = await async_client.patch(
        "/admin/bookings/booking-approved-1/complete",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["status"] == "COMPLETED"
    assert payload["completed_by"] is not None
    assert payload["completed_at"] is not None
    assert payload["room"]["id"] == "room-lab-01"


@pytest.mark.asyncio
async def test_non_admin_cannot_manage_bookings(async_client):
    register_payload = {
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "password": "Password123",
    }
    await async_client.post("/auth/register", json=register_payload)
    login_response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "Password123"},
    )
    access_token = login_response.json()["data"]["access_token"]

    response = await async_client.get(
        "/admin/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 403
