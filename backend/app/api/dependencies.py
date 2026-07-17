from typing import Callable

from fastapi import Depends, Header, Request

from app.core.exceptions import AppError
from app.core.security import decode_jwt
from app.repositories.user_repository import UserRepository


def get_request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError("Authentication required", "UNAUTHENTICATED", status_code=401)

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_jwt(token)
    except Exception as exc:
        raise AppError("Invalid or expired token", "UNAUTHENTICATED", status_code=401) from exc

    if payload.get("type") != "access":
        raise AppError("Invalid token type", "UNAUTHENTICATED", status_code=401)

    user = await UserRepository().find_by_id(payload["sub"])
    if user is None:
        raise AppError("User not found", "RESOURCE_NOT_FOUND", status_code=404)
    return user


async def require_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_active", True):
        raise AppError("Akun tidak aktif", "FORBIDDEN", status_code=403)
    return current_user


def require_role(role: str) -> Callable:
    async def dependency(current_user: dict = Depends(require_active_user)) -> dict:
        if current_user.get("role") != role:
            raise AppError("Forbidden", "FORBIDDEN", status_code=403)
        return current_user

    return dependency
