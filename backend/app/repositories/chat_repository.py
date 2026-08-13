from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4

from supabase import Client

from app.core.exceptions import AppError
from app.repositories.base import execute_query


class ChatRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def list_messages(
        self, analysis_id: UUID, limit: int = 100
    ) -> list[dict[str, Any]]:
        rows = execute_query(
            self.client.table("chat_messages")
            .select("*")
            .eq("analysis_id", str(analysis_id))
            .order("sequence", desc=True)
            .limit(limit)
        )
        rows.reverse()
        return rows

    def create_turn(
        self,
        analysis_id: UUID,
        user_content: str,
        assistant_content: str,
        model_name: str,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        turn_id = str(uuid4())
        rows = execute_query(
            self.client.table("chat_messages").insert(
                [
                    {
                        "analysis_id": str(analysis_id),
                        "turn_id": turn_id,
                        "role": "user",
                        "content": user_content,
                        "model_name": None,
                    },
                    {
                        "analysis_id": str(analysis_id),
                        "turn_id": turn_id,
                        "role": "assistant",
                        "content": assistant_content,
                        "model_name": model_name,
                    },
                ]
            )
        )
        rows_by_role = {str(row.get("role")): row for row in rows}
        if set(rows_by_role) != {"user", "assistant"}:
            raise AppError(
                "DATABASE_ERROR", "대화 내용을 저장하지 못했습니다.", 503
            )
        return rows_by_role["user"], rows_by_role["assistant"]
