import pytest


async def _login_student(async_client):
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
    return login_response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_create_booking_returns_pending(async_client):
    access_token = await _login_student(async_client)

    response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Rapat kelompok capstone",
            "participant_count": 10,
            "start_at": "2026-07-20T11:30:00+07:00",
            "end_at": "2026-07-20T13:00:00+07:00",
            "user_note": "Membutuhkan proyektor",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["data"]["status"] == "PENDING"
    assert payload["data"]["booking_code"].startswith("BKG-20260716-")
    assert payload["data"]["room"]["id"] == "room-lab-01"
    assert payload["data"]["user"]["email"] == "2311082027@student.pnp.ac.id"


@pytest.mark.asyncio
async def test_create_booking_rejects_maintenance_room(async_client):
    access_token = await _login_student(async_client)

    response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-rkt-01",
            "purpose": "Diskusi",
            "participant_count": 5,
            "start_at": "2026-07-20T09:00:00+07:00",
            "end_at": "2026-07-20T10:00:00+07:00",
            "user_note": None,
        },
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ROOM_NOT_AVAILABLE"


@pytest.mark.asyncio
async def test_create_booking_rejects_conflict_with_approved(async_client):
    access_token = await _login_student(async_client)

    response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Rapat bentrok",
            "participant_count": 5,
            "start_at": "2026-07-20T10:00:00+07:00",
            "end_at": "2026-07-20T12:00:00+07:00",
            "user_note": None,
        },
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "BOOKING_TIME_CONFLICT"


@pytest.mark.asyncio
async def test_list_my_bookings_returns_user_bookings(async_client):
    access_token = await _login_student(async_client)
    create_response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Rapat kelompok",
            "participant_count": 6,
            "start_at": "2026-07-21T09:00:00+07:00",
            "end_at": "2026-07-21T10:00:00+07:00",
            "user_note": None,
        },
    )
    created_id = create_response.json()["data"]["id"]

    response = await async_client.get(
        "/bookings/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["data"]]
    assert created_id in ids
    created_item = next(item for item in response.json()["data"] if item["id"] == created_id)
    assert created_item["room"]["id"] == "room-lab-01"
    assert created_item["user"]["email"] == "2311082027@student.pnp.ac.id"


@pytest.mark.asyncio
async def test_get_booking_detail_returns_owned_booking(async_client):
    access_token = await _login_student(async_client)
    create_response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Rapat kelompok",
            "participant_count": 6,
            "start_at": "2026-07-21T13:00:00+07:00",
            "end_at": "2026-07-21T14:00:00+07:00",
            "user_note": None,
        },
    )
    booking_id = create_response.json()["data"]["id"]

    response = await async_client.get(
        f"/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["id"] == booking_id
    assert response.json()["data"]["user"]["email"] == "2311082027@student.pnp.ac.id"
    assert response.json()["data"]["room"]["id"] == "room-lab-01"
    assert response.json()["data"]["room"]["name"] == "Laboratorium Komputer 1"


@pytest.mark.asyncio
async def test_cancel_booking_changes_status(async_client):
    access_token = await _login_student(async_client)
    create_response = await async_client.post(
        "/bookings",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "room_id": "room-lab-01",
            "purpose": "Rapat kelompok",
            "participant_count": 6,
            "start_at": "2026-07-21T16:00:00+07:00",
            "end_at": "2026-07-21T17:00:00+07:00",
            "user_note": None,
        },
    )
    booking_id = create_response.json()["data"]["id"]

    response = await async_client.patch(
        f"/bookings/{booking_id}/cancel",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "CANCELLED"
    assert response.json()["data"]["room"]["id"] == "room-lab-01"
    assert response.json()["data"]["user"]["email"] == "2311082027@student.pnp.ac.id"
