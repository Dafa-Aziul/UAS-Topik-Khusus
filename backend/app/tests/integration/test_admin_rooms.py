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


@pytest.mark.asyncio
async def test_admin_can_create_room(async_client, admin_access_token):
    response = await async_client.post(
        "/admin/rooms",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        data={
            "code": "LAB-NEW",
            "name": "Laboratorium Baru",
            "building": "Gedung D",
            "floor": "4",
            "location_description": "Lantai 4",
            "capacity": "25",
            "facilities": ["AC", "Proyektor"],
            "description": "Ruang baru",
            "status": "AVAILABLE",
        },
        files={"image_file": ("lab-new.png", b"fake-image-bytes", "image/png")},
    )

    assert response.status_code == 201
    assert response.json()["data"]["code"] == "LAB-NEW"
    assert response.json()["data"]["image_url"].startswith("/uploads/rooms/")


@pytest.mark.asyncio
async def test_admin_create_room_rejects_duplicate_code(async_client, admin_access_token):
    response = await async_client.post(
        "/admin/rooms",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        data={
            "code": "LAB-01",
            "name": "Duplicate Room",
            "building": "Gedung D",
            "floor": "1",
            "location_description": "Lantai 1",
            "capacity": "10",
            "facilities": ["AC"],
            "description": "Duplicate",
            "status": "AVAILABLE",
        },
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ROOM_CODE_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_admin_can_update_room(async_client, admin_access_token):
    response = await async_client.patch(
        "/admin/rooms/room-lab-01",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        data={"capacity": "50", "description": "Updated description"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["capacity"] == 50


@pytest.mark.asyncio
async def test_admin_can_update_room_with_image(async_client, admin_access_token):
    response = await async_client.patch(
        "/admin/rooms/room-lab-01",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        files={"image_file": ("updated-room.webp", b"fake-webp-bytes", "image/webp")},
    )

    assert response.status_code == 200
    assert response.json()["data"]["image_url"].startswith("/uploads/rooms/")


@pytest.mark.asyncio
async def test_admin_can_update_room_status(async_client, admin_access_token):
    response = await async_client.patch(
        "/admin/rooms/room-rkt-01/status",
        headers={"Authorization": f"Bearer {admin_access_token}"},
        json={"status": "AVAILABLE"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "AVAILABLE"


@pytest.mark.asyncio
async def test_admin_can_soft_delete_room(async_client, admin_access_token):
    response = await async_client.delete(
        "/admin/rooms/room-lab-01",
        headers={"Authorization": f"Bearer {admin_access_token}"},
    )

    assert response.status_code == 200

    public_response = await async_client.get("/rooms/room-lab-01")
    assert public_response.status_code == 404


@pytest.mark.asyncio
async def test_non_admin_cannot_manage_rooms(async_client):
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

    response = await async_client.post(
        "/admin/rooms",
        headers={"Authorization": f"Bearer {access_token}"},
        data={
            "code": "LAB-NONADMIN",
            "name": "Blocked Room",
            "building": "Gedung X",
            "floor": "1",
            "location_description": "Lantai 1",
            "capacity": "10",
            "facilities": ["AC"],
            "description": "Blocked",
            "status": "AVAILABLE",
        },
    )

    assert response.status_code == 403
