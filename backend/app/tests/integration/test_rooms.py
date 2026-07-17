import pytest


@pytest.mark.asyncio
async def test_list_rooms_returns_public_rooms(async_client):
    response = await async_client.get("/rooms")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Data ruangan berhasil diambil"
    assert payload["meta"]["page"] == 1
    assert all(room["status"] != "INACTIVE" for room in payload["data"])


@pytest.mark.asyncio
async def test_list_rooms_supports_filters(async_client):
    response = await async_client.get("/rooms", params={"building": "Gedung A", "facility": "Proyektor"})

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]) == 1
    assert payload["data"][0]["code"] == "LAB-01"


@pytest.mark.asyncio
async def test_get_room_detail_returns_room(async_client):
    response = await async_client.get("/rooms/room-lab-01")

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"]["code"] == "LAB-01"


@pytest.mark.asyncio
async def test_get_room_detail_rejects_inactive_room(async_client):
    response = await async_client.get("/rooms/room-rapat-01")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RESOURCE_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_room_availability_returns_approved_blocked_slots(async_client):
    response = await async_client.get("/rooms/room-lab-01/availability", params={"date": "2026-07-20"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"]["room_status"] == "AVAILABLE"
    assert payload["data"]["is_bookable"] is True
    assert len(payload["data"]["blocked_slots"]) == 1
    assert payload["data"]["blocked_slots"][0]["booking_id"] == "booking-approved-1"
