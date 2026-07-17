from fastapi import APIRouter

from app.schemas.common import ApiResponse


router = APIRouter()


@router.get("/", response_model=ApiResponse, tags=["root"])
async def get_root() -> ApiResponse:
    return ApiResponse(
        message="Welcome to Roomify Backend API",
        data={
            "app": "Roomify API",
            "docs": "/docs",
            "health": "/health",
        },
    )
