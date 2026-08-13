from __future__ import annotations

from typing import Any
from uuid import UUID

from supabase import Client

from app.core.exceptions import AppError
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.chat_repository import ChatRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.chat import (
    ChatHistoryResponse,
    ChatMessageResponse,
    ChatReplyResponse,
)
from app.services.openai_service import OpenAIService

CHAT_CONTEXT_MESSAGE_LIMIT = 20


def _candidate_context(candidate: dict[str, Any]) -> dict[str, object]:
    return {
        "title": candidate.get("title"),
        "reason": candidate.get("reason"),
        "evidence": candidate.get("evidence") or [],
        "selected": bool(candidate.get("selected", False)),
    }


class ChatService:
    def __init__(self, client: Client, openai_service: OpenAIService) -> None:
        self.client = client
        self.openai_service = openai_service

    def _get_completed_analysis(
        self, user_id: UUID, analysis_id: UUID
    ) -> dict[str, Any]:
        analysis = AnalysisRepository(self.client).get(user_id, analysis_id)
        if analysis is None:
            raise AppError("RESOURCE_NOT_FOUND", "분석 기록을 찾을 수 없습니다.", 404)
        if analysis.get("status") != "completed":
            raise AppError(
                "CHAT_NOT_AVAILABLE",
                "완료된 분석 기록에서만 AI 채팅을 사용할 수 있습니다.",
                409,
            )
        return analysis

    def list_messages(
        self, user_id: UUID, analysis_id: UUID, limit: int = 100
    ) -> ChatHistoryResponse:
        self._get_completed_analysis(user_id, analysis_id)
        rows = ChatRepository(self.client).list_messages(analysis_id, limit)
        return ChatHistoryResponse(
            analysis_id=analysis_id,
            messages=[ChatMessageResponse.model_validate(row) for row in rows],
        )

    async def reply(
        self, user_id: UUID, analysis_id: UUID, content: str
    ) -> ChatReplyResponse:
        analysis = self._get_completed_analysis(user_id, analysis_id)
        analysis_repo = AnalysisRepository(self.client)
        chat_repo = ChatRepository(self.client)

        symptom = SymptomRepository(self.client).get(
            user_id, UUID(str(analysis["symptom_id"]))
        )
        candidates = analysis_repo.list_candidates(analysis_id)
        recommendation = RecommendationRepository(self.client).get_latest_by_analysis(
            user_id, analysis_id
        )
        previous_messages = chat_repo.list_messages(
            analysis_id, CHAT_CONTEXT_MESSAGE_LIMIT
        )

        context: dict[str, object] = {
            "self_check": {
                "symptom": {
                    "category": symptom.get("category") if symptom else None,
                    "description": symptom.get("description") if symptom else None,
                    "is_repeated": symptom.get("is_repeated") if symptom else None,
                },
                "candidates": [_candidate_context(item) for item in candidates],
                "recommendation": (
                    {
                        "action": recommendation.get("action"),
                        "reason": recommendation.get("reason"),
                    }
                    if recommendation
                    else None
                ),
            },
            "conversation": [
                {"role": row.get("role"), "content": row.get("content")}
                for row in previous_messages[-CHAT_CONTEXT_MESSAGE_LIMIT:]
            ],
            "new_user_message": content,
        }
        answer = await self.openai_service.create_chat_reply(context)
        user_row, assistant_row = chat_repo.create_turn(
            analysis_id,
            content,
            answer.answer,
            self.openai_service.model_name,
        )
        return ChatReplyResponse(
            analysis_id=analysis_id,
            user_message=ChatMessageResponse.model_validate(user_row),
            assistant_message=ChatMessageResponse.model_validate(assistant_row),
        )
