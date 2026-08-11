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

    def list(self, user_id: UUID, limit: int = 30) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("analyses")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
        )

    def list_candidates(self, analysis_id: UUID) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("analysis_candidates")
            .select("*")
            .eq("analysis_id", str(analysis_id))
            .order("rank", desc=False)
        )

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

    def select_candidates(
        self,
        user_id: UUID,
        analysis_id: UUID,
        candidate_ids: list[UUID],
    ) -> dict[str, Any] | None:
        execute_query(
            self.client.table("analysis_candidates")
            .update({"selected": False})
            .eq("analysis_id", str(analysis_id))
        )
        if candidate_ids:
            execute_query(
                self.client.table("analysis_candidates")
                .update({"selected": True})
                .eq("analysis_id", str(analysis_id))
                .in_("id", [str(candidate_id) for candidate_id in candidate_ids])
            )
        rows = execute_query(
            self.client.table("analyses")
            .update({"selection_status": "candidate" if candidate_ids else "none"})
            .eq("id", str(analysis_id))
            .eq("user_id", str(user_id))
        )
        return first_or_none(rows)

    def get_selected_candidates(self, analysis_id: UUID) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("analysis_candidates")
            .select("*")
            .eq("analysis_id", str(analysis_id))
            .eq("selected", True)
            .order("rank", desc=False)
        )

