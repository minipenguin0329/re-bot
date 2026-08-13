from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4

from supabase import Client
from postgrest.exceptions import APIError

from app.core.exceptions import AppError


def _execute_chat_query(query: Any) -> list[dict[str, Any]]:
    try:
        response = query.execute()
    except APIError as exc:
        if getattr(exc, "code", None) == "PGRST205" and "chat_messages" in str(exc):
            raise AppError(
                "CHAT_STORAGE_NOT_READY",
                "대화 저장소가 준비되지 않았습니다. Supabase 채팅 마이그레이션을 적용해주세요.",
                503,
            ) from exc
        raise AppError(
            "DATABASE_ERROR", "데이터베이스 요청을 처리하지 못했습니다.", 503
        ) from exc
    except AppError:
        raise
    except Exception as exc:
        raise AppError(
            "DATABASE_ERROR", "데이터베이스 요청을 처리하지 못했습니다.", 503
        ) from exc
    return list(getattr(response, "data", None) or [])


class ChatRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def list_messages(
        self, analysis_id: UUID, limit: int = 100
    ) -> list[dict[str, Any]]:
        rows = _execute_chat_query(
            self.client.table("chat_messages")
            .select("*")
            .eq("analysis_id", str(analysis_id))
            .order("sequence", desc=True)
            .limit(limit)
        )
        rows.reverse()
        return rows

    def delete_messages(self, analysis_id: UUID) -> int:
        rows = _execute_chat_query(
            self.client.table("chat_messages")
            .delete()
            .eq("analysis_id", str(analysis_id))
        )
        return len(rows)

    def create_turn(
        self,
        analysis_id: UUID,
        user_content: str,
        assistant_content: str,
        model_name: str,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        turn_id = str(uuid4())
        rows = _execute_chat_query(
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
