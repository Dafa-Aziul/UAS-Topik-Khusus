from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging import configure_logging
from app.lifespan import lifespan
from app.middleware.access_log import AccessLogMiddleware
from app.middleware.request_id import RequestIDMiddleware


settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
    lifespan=lifespan,
)
settings.uploads_root_path.mkdir(parents=True, exist_ok=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(AccessLogMiddleware)
register_exception_handlers(app)
app.include_router(api_router)
app.mount(f"/{settings.upload_dir.strip('/')}", StaticFiles(directory=settings.uploads_root_path), name="uploads")
