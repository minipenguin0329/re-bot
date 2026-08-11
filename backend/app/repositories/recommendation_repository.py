from __future__ import annotations

from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none


class RecommendationRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create(
        self,
        user_id: UUID,
        analysis_id: UUID,
        candidate_id: UUID | None,
        values: dict[str, Any],
    ) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("recommendations").insert(
                {
                    "user_id": str(user_id),
                    "analysis_id": str(analysis_id),
                    "candidate_id": str(candidate_id) if candidate_id else None,
                    **values,
                }
            )
        )
        return rows[0]

    def get_latest_by_analysis(
        self, user_id: UUID, analysis_id: UUID
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("recommendations")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("analysis_id", str(analysis_id))
            .order("created_at", desc=True)
            .limit(1)
        )
        return first_or_none(rows)

    def get(self, user_id: UUID, recommendation_id: UUID) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("recommendations")
            .select("*")
            .eq("id", str(recommendation_id))
            .eq("user_id", str(user_id))
            .limit(1)
        )
        return first_or_none(rows)

    def save_feedback(
        self,
        user_id: UUID,
        recommendation_id: UUID,
        values: dict[str, Any],
    ) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("recommendation_feedback").insert(
                {
                    "user_id": str(user_id),
                    "recommendation_id": str(recommendation_id),
                    **values,
                }
            )
        )
        return rows[0]

    def list_recent_feedback(
        self, user_id: UUID, limit: int = 10
    ) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("recommendation_feedback")
            .select("feedback,reason,created_at,recommendations(action)")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
        )

    def get_latest_negative_feedback(
        self, user_id: UUID, recommendation_id: UUID
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("recommendation_feedback")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("recommendation_id", str(recommendation_id))
            .eq("feedback", "negative")
            .order("created_at", desc=True)
            .limit(1)
        )
        return first_or_none(rows)

