import pytest


@pytest.mark.asyncio
async def test_root_endpoint_returns_welcome_message(async_client):
    response = await async_client.get("/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Welcome to Roomify Backend API"
    assert payload["data"]["docs"] == "/docs"
    assert payload["data"]["health"] == "/health"
