from __future__ import annotations

from datetime import date
from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none


class ReportRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def get_period(
        self, user_id: UUID, period_type: str, start_date: date, end_date: date
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("reports")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("period_type", period_type)
            .eq("period_start", start_date.isoformat())
            .eq("period_end", end_date.isoformat())
            .limit(1)
        )
        return first_or_none(rows)

    def save(
        self,
        user_id: UUID,
        period_type: str,
        start_date: date,
        end_date: date,
        statistics: dict[str, Any],
        summary: dict[str, Any],
    ) -> dict[str, Any]:
        existing = self.get_period(user_id, period_type, start_date, end_date)
        values = {"statistics": statistics, "summary": summary}
        if existing:
            rows = execute_query(
                self.client.table("reports")
                .update(values)
                .eq("id", existing["id"])
                .eq("user_id", str(user_id))
            )
            return rows[0]
        rows = execute_query(
            self.client.table("reports").insert(
                {
                    "user_id": str(user_id),
                    "period_type": period_type,
                    "period_start": start_date.isoformat(),
                    "period_end": end_date.isoformat(),
                    **values,
                }
            )
        )
        return rows[0]

