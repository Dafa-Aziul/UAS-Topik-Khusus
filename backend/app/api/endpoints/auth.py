from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies import require_active_user
from app.core.constants import REFRESH_TOKEN_COOKIE
from app.schemas.activity_log import ActivityLogAction
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
    RegisterRequest,
    RegisterResponse,
    TokenData,
    UserAuthData,
)
from app.schemas.common import ApiResponse
from app.services.activity_log_service import ActivityLogService
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()
activity_log_service = ActivityLogService()


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(request: RegisterRequest, http_request: Request) -> RegisterResponse:
    user = await auth_service.register_student(
        name=request.name,
        nim=request.nim,
        email=request.email,
        password=request.password,
    )
    await activity_log_service.record(
        actor_id=user["_id"],
        actor_role=user["role"],
        action=ActivityLogAction.USER_REGISTERED,
        entity_type="USER",
        entity_id=user["_id"],
        description="Mahasiswa melakukan registrasi akun",
        metadata={"email": user["email"], "nim": user["nim"]},
        ip_address=http_request.client.host if http_request.client else None,
        request_id=getattr(http_request.state, "request_id", None),
    )
    return RegisterResponse(
        message="Registrasi mahasiswa berhasil",
        data=UserAuthData.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response, http_request: Request) -> LoginResponse:
    access_token, refresh_token, user = await auth_service.login(email=request.email, password=request.password)
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    await activity_log_service.record(
        actor_id=user["_id"],
        actor_role=user["role"],
        action=ActivityLogAction.USER_LOGGED_IN,
        entity_type="USER",
        entity_id=user["_id"],
        description="Pengguna berhasil login",
        request_id=getattr(http_request.state, "request_id", None),
        ip_address=http_request.client.host if http_request.client else None,
    )
    return LoginResponse(
        message="Login berhasil",
        data=TokenData(access_token=access_token),
    )


@router.post("/refresh", response_model=LoginResponse)
async def refresh(request: Request, response: Response) -> LoginResponse:
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_token:
        from app.core.exceptions import AppError

        raise AppError("Refresh token tidak ditemukan", "UNAUTHENTICATED", status_code=401)

    access_token, new_refresh_token, user = await auth_service.refresh_access_token(refresh_token)
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    await activity_log_service.record(
        actor_id=user["_id"],
        actor_role=user["role"],
        action=ActivityLogAction.USER_LOGGED_IN,
        entity_type="USER",
        entity_id=user["_id"],
        description="Pengguna melakukan refresh session",
        request_id=getattr(request.state, "request_id", None),
        ip_address=request.client.host if request.client else None,
    )
    return LoginResponse(
        message="Refresh token berhasil",
        data=TokenData(access_token=access_token),
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(request: Request, response: Response) -> ApiResponse:
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if refresh_token:
        user = await auth_service.get_user_from_refresh_token(refresh_token)
        await auth_service.logout(refresh_token)
        await activity_log_service.record(
            actor_id=user["_id"],
            actor_role=user["role"],
            action=ActivityLogAction.USER_LOGGED_OUT,
            entity_type="USER",
            entity_id=user["_id"],
            description="Pengguna berhasil logout",
            request_id=getattr(request.state, "request_id", None),
            ip_address=request.client.host if request.client else None,
        )
    response.delete_cookie(REFRESH_TOKEN_COOKIE)
    return ApiResponse(message="Logout berhasil", data=None)


@router.get("/me", response_model=MeResponse)
async def me(current_user: dict = Depends(require_active_user)) -> MeResponse:
    user = await auth_service.get_current_user_profile(current_user["_id"])
    return MeResponse(
        message="Profil pengguna berhasil diambil",
        data=UserAuthData.model_validate(user),
    )


@router.patch("/change-password", response_model=ApiResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(require_active_user),
    http_request: Request = None,
) -> ApiResponse:
    await auth_service.change_password(
        user_id=current_user["_id"],
        current_password=request.current_password,
        new_password=request.new_password,
    )
    await activity_log_service.record(
        actor_id=current_user["_id"],
        actor_role=current_user["role"],
        action=ActivityLogAction.PASSWORD_CHANGED,
        entity_type="USER",
        entity_id=current_user["_id"],
        description="Pengguna mengubah password",
        request_id=getattr(http_request.state, "request_id", None) if http_request else None,
        ip_address=http_request.client.host if http_request and http_request.client else None,
    )
    return ApiResponse(message="Password berhasil diubah", data=None)
