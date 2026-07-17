import pytest

from app.core.constants import REFRESH_TOKEN_COOKIE
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository


@pytest.fixture(autouse=True)
def clear_user_store():
    UserRepository._memory_store.clear()
    RefreshTokenRepository._memory_store.clear()
    yield
    UserRepository._memory_store.clear()
    RefreshTokenRepository._memory_store.clear()


@pytest.mark.asyncio
async def test_register_returns_created_student(async_client):
    response = await async_client.post(
        "/auth/register",
        json={
            "name": "Muhammad Dafa Aziul Ardi",
            "nim": "2311082027",
            "email": "2311082027@student.pnp.ac.id",
            "password": "Password123",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Registrasi mahasiswa berhasil"
    assert payload["data"]["nim"] == "2311082027"
    assert payload["data"]["role"] == "MAHASISWA"


@pytest.mark.asyncio
async def test_register_rejects_duplicate_nim(async_client):
    payload = {
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "password": "Password123",
    }
    await async_client.post("/auth/register", json=payload)

    response = await async_client.post(
        "/auth/register",
        json={**payload, "email": "other@student.pnp.ac.id"},
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "NIM_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_login_returns_access_token(async_client):
    register_payload = {
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "password": "Password123",
    }
    await async_client.post("/auth/register", json=register_payload)

    response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "Password123"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["token_type"] == "bearer"
    assert isinstance(payload["data"]["access_token"], str)
    assert payload["data"]["access_token"]
    assert REFRESH_TOKEN_COOKIE in response.cookies


@pytest.mark.asyncio
async def test_login_rejects_invalid_credentials(async_client):
    response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "WrongPass123"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_register_rejects_duplicate_email(async_client):
    payload = {
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "password": "Password123",
    }
    await async_client.post("/auth/register", json=payload)

    response = await async_client.post(
        "/auth/register",
        json={**payload, "nim": "2311082028"},
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_me_returns_current_user_profile(async_client):
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
        "/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["email"] == "2311082027@student.pnp.ac.id"


@pytest.mark.asyncio
async def test_change_password_updates_credentials(async_client):
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

    change_response = await async_client.patch(
        "/auth/change-password",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"current_password": "Password123", "new_password": "NewPassword123"},
    )

    assert change_response.status_code == 200

    old_login_response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "Password123"},
    )
    assert old_login_response.status_code == 401

    new_login_response = await async_client.post(
        "/auth/login",
        json={"email": "2311082027@student.pnp.ac.id", "password": "NewPassword123"},
    )
    assert new_login_response.status_code == 200


@pytest.mark.asyncio
async def test_refresh_rotates_refresh_token(async_client):
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
    old_refresh = login_response.cookies.get(REFRESH_TOKEN_COOKIE)

    response = await async_client.post(
        "/auth/refresh",
    )

    assert response.status_code == 200
    assert response.json()["data"]["access_token"]
    assert response.cookies.get(REFRESH_TOKEN_COOKIE)
    assert response.cookies.get(REFRESH_TOKEN_COOKIE) != old_refresh


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(async_client):
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
    refresh_token = login_response.cookies.get(REFRESH_TOKEN_COOKIE)

    logout_response = await async_client.post(
        "/auth/logout",
    )
    assert logout_response.status_code == 200

    async_client.cookies.set(REFRESH_TOKEN_COOKIE, refresh_token)
    refresh_response = await async_client.post(
        "/auth/refresh",
    )
    assert refresh_response.status_code == 401
