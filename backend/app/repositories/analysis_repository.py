from __future__ import annotations

from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.base import execute_query, first_or_none
from app.schemas.analysis import CauseCandidate


class AnalysisRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create_pending(
        self, user_id: UUID, symptom_id: UUID, model_name: str
    ) -> dict[str, Any]:
        rows = execute_query(
            self.client.table("analyses").insert(
                {
                    "user_id": str(user_id),
                    "symptom_id": str(symptom_id),
                    "status": "pending",
                    "model_name": model_name,
                    "selection_status": "unselected",
                    "selected_candidate_id": None,
                }
            )
        )
        return rows[0]

    def set_status(self, analysis_id: UUID, user_id: UUID, status: str) -> None:
        execute_query(
            self.client.table("analyses")
            .update({"status": status})
            .eq("id", str(analysis_id))
            .eq("user_id", str(user_id))
        )

    def save_candidates(
        self, analysis_id: UUID, candidates: list[CauseCandidate]
    ) -> list[dict[str, Any]]:
        payload = [
            {
                "analysis_id": str(analysis_id),
                "rank": rank,
                **candidate.model_dump(),
            }
            for rank, candidate in enumerate(candidates, start=1)
        ]
        if not payload:
            return []
        return execute_query(self.client.table("analysis_candidates").insert(payload))

    def get(self, user_id: UUID, analysis_id: UUID) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("analyses")
            .select("*")
            .eq("id", str(analysis_id))
            .eq("user_id", str(user_id))
            .limit(1)
        )
        return first_or_none(rows)

    def get_candidate(
        self, analysis_id: UUID, candidate_id: UUID
    ) -> dict[str, Any] | None:
        rows = execute_query(
            self.client.table("analysis_candidates")
            .select("*")
            .eq("id", str(candidate_id))
            .eq("analysis_id", str(analysis_id))
            .limit(1)
        )
        return first_or_none(rows)

    def select_candidate(
        self,
        user_id: UUID,
        analysis_id: UUID,
        candidate_id: UUID | None,
    ) -> dict[str, Any] | None:
        values = {
            "selection_status": "candidate" if candidate_id else "none",
            "selected_candidate_id": str(candidate_id) if candidate_id else None,
        }
        rows = execute_query(
            self.client.table("analyses")
            .update(values)
            .eq("id", str(analysis_id))
            .eq("user_id", str(user_id))
        )
        return first_or_none(rows)

