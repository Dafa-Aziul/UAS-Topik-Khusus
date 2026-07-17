from fastapi import APIRouter

from app.api.endpoints.activity_logs import router as activity_logs_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.bookings import admin_router as admin_bookings_router
from app.api.endpoints.bookings import router as bookings_router
from app.api.endpoints.dashboards import router as dashboards_router
from app.api.endpoints.health import router as health_router
from app.api.endpoints.root import router as root_router
from app.api.endpoints.rooms import admin_router as admin_rooms_router
from app.api.endpoints.rooms import router as rooms_router
from app.api.endpoints.users import router as users_router


api_router = APIRouter()
api_router.include_router(root_router)
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(rooms_router, prefix="/rooms", tags=["rooms"])
api_router.include_router(admin_rooms_router, prefix="/admin", tags=["admin-rooms"])
api_router.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
api_router.include_router(admin_bookings_router, prefix="/admin", tags=["admin-bookings"])
api_router.include_router(dashboards_router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(activity_logs_router, prefix="/activity-logs", tags=["activity-logs"])
