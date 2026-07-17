from fastapi import APIRouter

from app.database.mongodb import mongodb_is_connected
from app.database.redis import redis_is_connected
from app.schemas.health import HealthStatusResponse


router = APIRouter(prefix="/health")


@router.get("", response_model=HealthStatusResponse)
async def get_health_status() -> HealthStatusResponse:
    mongodb_ok = mongodb_is_connected()
    redis_ok = redis_is_connected()
    status = "ok" if mongodb_ok else "degraded"

    return HealthStatusResponse(
        message="Service health retrieved successfully",
        data={
            "status": status,
            "services": {
                "api": "ok",
                "mongodb": "ok" if mongodb_ok else "unavailable",
                "redis": "ok" if redis_ok else "disabled",
            },
        },
    )


@router.get("/live", response_model=HealthStatusResponse)
async def get_liveness_status() -> HealthStatusResponse:
    return HealthStatusResponse(
        message="Liveness probe succeeded",
        data={"status": "ok"},
    )


@router.get("/ready", response_model=HealthStatusResponse)
async def get_readiness_status() -> HealthStatusResponse:
    mongodb_ok = mongodb_is_connected()
    redis_ok = redis_is_connected()

    return HealthStatusResponse(
        message="Readiness probe evaluated",
        data={
            "status": "ready" if mongodb_ok else "not_ready",
            "services": {
                "mongodb": "ok" if mongodb_ok else "unavailable",
                "redis": "ok" if redis_ok else "disabled",
            },
        },
    )
