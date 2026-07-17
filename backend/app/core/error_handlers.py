from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.constants import REQUEST_ID_HEADER
from app.core.exceptions import AppError


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            headers={REQUEST_ID_HEADER: _request_id(request) or ""},
            content={
                "success": False,
                "message": exc.message,
                "error": {"code": exc.code, "details": exc.details},
                "request_id": _request_id(request),
                "timestamp": _timestamp(),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            headers={REQUEST_ID_HEADER: _request_id(request) or ""},
            content={
                "success": False,
                "message": "Request validation failed",
                "error": {"code": "VALIDATION_ERROR", "details": exc.errors()},
                "request_id": _request_id(request),
                "timestamp": _timestamp(),
            },
        )
