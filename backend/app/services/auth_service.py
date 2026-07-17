from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_jwt,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository | None = None,
        refresh_token_repository: RefreshTokenRepository | None = None,
    ):
        self.user_repository = user_repository or UserRepository()
        self.refresh_token_repository = refresh_token_repository or RefreshTokenRepository()

    async def register_student(self, *, name: str, nim: str, email: str, password: str) -> dict:
        existing_nim = await self.user_repository.find_by_nim(nim)
        if existing_nim is not None:
            raise AppError("NIM sudah terdaftar", "NIM_ALREADY_EXISTS", status_code=409)

        existing_email = await self.user_repository.find_by_email(email)
        if existing_email is not None:
            raise AppError("Email sudah terdaftar", "EMAIL_ALREADY_EXISTS", status_code=409)

        user = await self.user_repository.create_user(
            name=name,
            nim=nim,
            email=email,
            password_hash=hash_password(password),
            role="MAHASISWA",
        )
        response_user = dict(user)
        response_user.pop("password_hash", None)
        return response_user

    async def login(self, *, email: str, password: str) -> tuple[str, str, dict]:
        user = await self.user_repository.find_by_email(email)
        if user is None or not verify_password(password, user["password_hash"]):
            raise AppError("Email atau password tidak valid", "INVALID_CREDENTIALS", status_code=401)

        if not user.get("is_active", True):
            raise AppError("Akun tidak aktif", "FORBIDDEN", status_code=403)

        access_token = create_access_token(subject=user["_id"], role=user["role"])
        refresh_token, jti, expires_at = create_refresh_token(subject=user["_id"])
        await self.refresh_token_repository.save_token(
            jti=jti,
            user_id=user["_id"],
            token_hash=hash_refresh_token(refresh_token),
            expires_at=expires_at,
        )
        response_user = dict(user)
        response_user.pop("password_hash", None)
        return access_token, refresh_token, response_user

    async def refresh_access_token(self, refresh_token: str) -> tuple[str, str, dict]:
        try:
            payload = decode_jwt(refresh_token)
        except Exception as exc:
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401) from exc

        if payload.get("type") != "refresh":
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401)

        stored = await self.refresh_token_repository.find_by_jti(payload["jti"])
        if stored is None or stored.get("revoked_at") is not None:
            raise AppError("Refresh token telah dicabut", "REFRESH_TOKEN_REVOKED", status_code=401)

        if stored["token_hash"] != hash_refresh_token(refresh_token):
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401)

        user = await self.user_repository.find_by_id(payload["sub"])
        if user is None:
            raise AppError("User not found", "RESOURCE_NOT_FOUND", status_code=404)

        await self.refresh_token_repository.revoke_token(payload["jti"])
        access_token = create_access_token(subject=user["_id"], role=user["role"])
        new_refresh_token, new_jti, expires_at = create_refresh_token(subject=user["_id"])
        await self.refresh_token_repository.save_token(
            jti=new_jti,
            user_id=user["_id"],
            token_hash=hash_refresh_token(new_refresh_token),
            expires_at=expires_at,
        )
        response_user = dict(user)
        response_user.pop("password_hash", None)
        return access_token, new_refresh_token, response_user

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = decode_jwt(refresh_token)
        except Exception as exc:
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401) from exc

        if payload.get("type") != "refresh":
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401)
        await self.refresh_token_repository.revoke_token(payload["jti"])

    async def get_user_from_refresh_token(self, refresh_token: str) -> dict:
        try:
            payload = decode_jwt(refresh_token)
        except Exception as exc:
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401) from exc

        if payload.get("type") != "refresh":
            raise AppError("Refresh token tidak valid", "UNAUTHENTICATED", status_code=401)

        user = await self.user_repository.find_by_id(payload["sub"])
        if user is None:
            raise AppError("User not found", "RESOURCE_NOT_FOUND", status_code=404)

        response_user = dict(user)
        response_user.pop("password_hash", None)
        return response_user

    async def get_current_user_profile(self, user_id: str) -> dict:
        user = await self.user_repository.find_by_id(user_id)
        if user is None:
            raise AppError("User not found", "RESOURCE_NOT_FOUND", status_code=404)
        response_user = dict(user)
        response_user.pop("password_hash", None)
        return response_user

    async def change_password(self, *, user_id: str, current_password: str, new_password: str) -> None:
        user = await self.user_repository.find_by_id(user_id)
        if user is None:
            raise AppError("User not found", "RESOURCE_NOT_FOUND", status_code=404)
        if not verify_password(current_password, user["password_hash"]):
            raise AppError("Password lama tidak valid", "INVALID_CREDENTIALS", status_code=401)
        await self.user_repository.update_password(user_id, hash_password(new_password))
