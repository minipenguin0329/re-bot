from typing import Annotated

from fastapi import Depends
from supabase import Client

from app.core.security import AccessToken, CurrentUser, get_current_user
from app.db.supabase import get_user_supabase_client


def get_database_client(access_token: AccessToken) -> Client:
    return get_user_supabase_client(access_token)


AuthenticatedUser = Annotated[CurrentUser, Depends(get_current_user)]
DatabaseClient = Annotated[Client, Depends(get_database_client)]
