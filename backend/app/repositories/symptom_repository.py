from __future__ import annotations

from datetime import date, datetime, time, timezone
from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none


class SymptomRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create(self, user_id: UUID, values: dict[str, Any]) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("symptoms").insert({"user_id": str(user_id), **values})
        )
        return rows[0]

    def list(self, user_id: UUID) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("symptoms")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
        )

    def get(self, user_id: UUID, symptom_id: UUID) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("symptoms")
            .select("*")
            .eq("id", str(symptom_id))
            .eq("user_id", str(user_id))
            .limit(1)
        )
        return first_or_none(rows)

    def list_similar(
        self, user_id: UUID, category: str, exclude_id: UUID, limit: int = 5
    ) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("symptoms")
            .select("id,category,is_repeated,created_at")
            .eq("user_id", str(user_id))
            .eq("category", category)
            .neq("id", str(exclude_id))
            .order("created_at", desc=True)
            .limit(limit)
        )

    def count_period(self, user_id: UUID, start_date: date, end_date: date) -> int:
        start = datetime.combine(start_date, time.min, tzinfo=timezone.utc).isoformat()
        end = datetime.combine(end_date, time.max, tzinfo=timezone.utc).isoformat()
        rows = execute_query(
            self.client.table("symptoms")
            .select("id")
            .eq("user_id", str(user_id))
            .gte("created_at", start)
            .lte("created_at", end)
        )
        return len(rows)

    def set_image_path(
        self, user_id: UUID, symptom_id: UUID, image_path: str
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("symptoms")
            .update({"image_path": image_path})
            .eq("id", str(symptom_id))
            .eq("user_id", str(user_id))
        )
        return first_or_none(rows)

    def delete(self, user_id: UUID, symptom_id: UUID) -> bool:
        rows = execute_query(
            self.client.table("symptoms")
            .delete()
            .eq("id", str(symptom_id))
            .eq("user_id", str(user_id))
        )
        return bool(rows)
