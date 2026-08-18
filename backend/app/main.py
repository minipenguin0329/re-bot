from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analysis import router as analysis_router
from app.api.routes.chats import router as chats_router
from app.api.routes.health import router as health_router
from app.api.routes.logs import router as logs_router
from app.api.routes.profile import router as profile_router
from app.api.routes.products import router as products_router
from app.api.routes.recommendations import router as recommendations_router
from app.api.routes.reports import router as reports_router
from app.api.routes.symptoms import router as symptoms_router
from app.core.config import get_settings
from app.core.exceptions import RequestIdMiddleware, register_exception_handlers


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title="RE:BOT Wellness API",
        description=(
            "생활 기록을 바탕으로 확인 가능한 원인 후보와 작은 행동을 제안하는 "
            "비의료 웰니스 API"
        ),
        version="0.1.0",
    )

    application.add_middleware(RequestIdMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    register_exception_handlers(application)
    application.include_router(health_router)
    application.include_router(profile_router, prefix="/api")
    application.include_router(logs_router, prefix="/api")
    application.include_router(symptoms_router, prefix="/api")
    application.include_router(analysis_router, prefix="/api")
    application.include_router(chats_router, prefix="/api")
    application.include_router(recommendations_router, prefix="/api")
    application.include_router(reports_router, prefix="/api")
    application.include_router(products_router, prefix="/api")
    return application


app = create_app()
