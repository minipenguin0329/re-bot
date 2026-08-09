from functools import lru_cache

from supabase import Client, ClientOptions, create_client

from app.core.config import get_settings
from app.core.exceptions import AppError


@lru_cache
def get_supabase_client() -> Client:
    """Return the public client used only to validate Supabase access tokens."""

    settings = get_settings()
    public_key = settings.supabase_public_key
    if not settings.supabase_url or not public_key:
        raise AppError(
            "DATABASE_ERROR",
            "Supabase 공개 연결 환경변수가 설정되지 않았습니다.",
            status_code=503,
        )

    return create_client(
        settings.supabase_url,
        public_key,
        options=ClientOptions(auto_refresh_token=False, persist_session=False),
    )


def get_user_supabase_client(access_token: str) -> Client:
    """Create a request-scoped client whose DB and Storage calls obey user RLS."""

    settings = get_settings()
    public_key = settings.supabase_public_key
    if not settings.supabase_url or not public_key:
        raise AppError(
            "DATABASE_ERROR",
            "Supabase 공개 연결 환경변수가 설정되지 않았습니다.",
            status_code=503,
        )

    return create_client(
        settings.supabase_url,
        public_key,
        options=ClientOptions(
            headers={"Authorization": f"Bearer {access_token}"},
            auto_refresh_token=False,
            persist_session=False,
        ),
    )
