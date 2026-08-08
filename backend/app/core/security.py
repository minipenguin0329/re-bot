from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.exceptions import AppError
from app.db.supabase import get_supabase_client

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: UUID
    email: str | None = None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError("AUTH_REQUIRED", "로그인이 필요합니다.", status_code=401)

    try:
        client = get_supabase_client()
        auth_response = client.auth.get_user(credentials.credentials)
        auth_user = auth_response.user
    except Exception as exc:
        raise AppError(
            "INVALID_TOKEN", "유효하지 않거나 만료된 토큰입니다.", status_code=401
        ) from exc

    if auth_user is None or not getattr(auth_user, "id", None):
        raise AppError(
            "INVALID_TOKEN", "유효하지 않거나 만료된 토큰입니다.", status_code=401
        )

    try:
        user_id = UUID(str(auth_user.id))
    except (TypeError, ValueError) as exc:
        raise AppError("INVALID_TOKEN", "토큰의 사용자 정보가 올바르지 않습니다.", 401) from exc

    return CurrentUser(id=user_id, email=getattr(auth_user, "email", None))
