from functools import lru_cache

from supabase import Client, ClientOptions, create_client

from app.core.config import get_settings
from app.core.exceptions import AppError


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise AppError(
            "DATABASE_ERROR",
            "Supabase 서버 환경변수가 설정되지 않았습니다.",
            status_code=503,
        )

    # The service-role client remains backend-only. Repository queries still
    # include user_id ownership filters because this key bypasses RLS.
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
        options=ClientOptions(auto_refresh_token=False, persist_session=False),
    )

