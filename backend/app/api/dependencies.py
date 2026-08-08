from typing import Annotated

from fastapi import Depends
from supabase import Client

from app.core.security import CurrentUser, get_current_user
from app.db.supabase import get_supabase_client

AuthenticatedUser = Annotated[CurrentUser, Depends(get_current_user)]
DatabaseClient = Annotated[Client, Depends(get_supabase_client)]

