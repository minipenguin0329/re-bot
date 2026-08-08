from __future__ import annotations

from datetime import date, timedelta
from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none


class LogRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create(self, user_id: UUID, values: dict[str, Any]) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("daily_logs").insert({"user_id": str(user_id), **values})
        )
        return rows[0]

    def list(self, user_id: UUID, days: int | None = None) -> list[dict[str, Any]]:
        query = self.client.table("daily_logs").select("*").eq("user_id", str(user_id))
        if days is not None:
            start_date = date.today() - timedelta(days=days - 1)
            query = query.gte("date", start_date.isoformat())
        return execute_query(query.order("date", desc=True))

    def list_period(
        self, user_id: UUID, start_date: date, end_date: date
    ) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("daily_logs")
            .select("*")
            .eq("user_id", str(user_id))
            .gte("date", start_date.isoformat())
            .lte("date", end_date.isoformat())
            .order("date")
        )

    def get(self, user_id: UUID, log_id: UUID) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("daily_logs")
            .select("*")
            .eq("id", str(log_id))
            .eq("user_id", str(user_id))
            .limit(1)
        )
        return first_or_none(rows)

    def update(
        self, user_id: UUID, log_id: UUID, values: dict[str, Any]
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("daily_logs")
            .update(values)
            .eq("id", str(log_id))
            .eq("user_id", str(user_id))
        )
        return first_or_none(rows)

    def delete(self, user_id: UUID, log_id: UUID) -> bool:
        rows = execute_query(
            self.client.table("daily_logs")
            .delete()
            .eq("id", str(log_id))
            .eq("user_id", str(user_id))
        )
        return bool(rows)
