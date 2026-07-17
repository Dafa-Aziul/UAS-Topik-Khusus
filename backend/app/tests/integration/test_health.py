import pytest


@pytest.mark.asyncio
async def test_health_endpoint_returns_service_status(async_client):
    response = await async_client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] in {"ok", "degraded"}
    assert payload["data"]["services"]["api"] == "ok"
    assert "mongodb" in payload["data"]["services"]
    assert "redis" in payload["data"]["services"]


@pytest.mark.asyncio
async def test_liveness_endpoint_returns_ok(async_client):
    response = await async_client.get("/health/live")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness_endpoint_returns_readiness_status(async_client):
    response = await async_client.get("/health/ready")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] in {"ready", "not_ready"}
