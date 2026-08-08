from __future__ import annotations

from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none


class ProfileRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def get(self, user_id: UUID) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("profiles").select("*").eq("id", str(user_id)).limit(1)
        )
        return first_or_none(rows)

    def upsert(self, user_id: UUID, values: dict[str, Any]) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("profiles").upsert({"id": str(user_id), **values})
        )
        return rows[0]

    def update(self, user_id: UUID, values: dict[str, Any]) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("profiles").update(values).eq("id", str(user_id))
        )
        return first_or_none(rows)
