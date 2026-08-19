from typing import Any
from uuid import UUID

from supabase import Client

from app.core.exceptions import AppError
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.log_repository import LogRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.recommendation import RecommendationResponse
from app.services.openai_service import OpenAIService


def _feedback_preferences(feedback: list[dict[str, Any]]) -> dict[str, object]:
    liked_actions: list[str] = []
    disliked_actions: list[str] = []
    negative_reasons: list[str] = []
    for item in feedback:
        recommendation = item.get("recommendations") or {}
        action = recommendation.get("action") if isinstance(recommendation, dict) else None
        if item.get("feedback") == "positive" and action:
            liked_actions.append(str(action))
        elif item.get("feedback") == "negative":
            if action:
                disliked_actions.append(str(action))
            if item.get("reason"):
                negative_reasons.append(str(item["reason"]))
    return {
        "liked_actions": liked_actions,
        "disliked_actions": disliked_actions,
        "constraints_from_negative_feedback": negative_reasons,
    }


class RecommendationService:
    def __init__(self, client: Client, openai_service: OpenAIService) -> None:
        self.client = client
        self.openai_service = openai_service

    async def create(self, user_id: UUID, analysis_id: UUID) -> RecommendationResponse:
        analysis_repo = AnalysisRepository(self.client)
        analysis = analysis_repo.get(user_id, analysis_id)
        if analysis is None:
            raise AppError("RESOURCE_NOT_FOUND", "분석 기록을 찾을 수 없습니다.", 404)
        if analysis.get("selection_status") == "unselected":
            raise AppError("VALIDATION_ERROR", "먼저 원인 후보를 선택해주세요.", 409)

        selected_candidates = analysis_repo.get_selected_candidates(analysis_id)
        symptom = SymptomRepository(self.client).get(
            user_id, UUID(str(analysis["symptom_id"]))
        )
        candidate_context = (
            [
                {
                    key: candidate.get(key)
                    for key in ("title", "reason", "evidence", "confirmation_question")
                }
                for candidate in selected_candidates
            ]
            if selected_candidates
            else "none_of_the_candidates"
        )
        recent_logs = LogRepository(self.client).list(user_id, days=14)
        log_fields = (
            "date",
            "sleep_hours",
            "sleep_irregular",
            "breakfast",
            "lunch",
            "dinner",
            "caffeine_count",
            "meal_note",
        )
        profile = ProfileRepository(self.client).get(user_id) or {}
        recent_feedback = RecommendationRepository(
            self.client
        ).list_recent_feedback(user_id)
        context: dict[str, object] = {
            "selected_candidates": candidate_context,
            "current_discomfort_category": symptom.get("category") if symptom else None,
            "job": profile.get("job"),
            "special_notes": profile.get("special_notes"),
            "special_notes_classification": profile.get(
                "special_notes_classification", []
            ),
            "recent_daily_logs": [
                {field: log.get(field) for field in log_fields} for log in recent_logs
            ],
            "recent_feedback": recent_feedback,
            "learned_preferences": _feedback_preferences(recent_feedback),
        }
        result = await self.openai_service.create_recommendation(context)
        single_candidate_id = (
            UUID(str(selected_candidates[0]["id"]))
            if len(selected_candidates) == 1
            else None
        )
        row = RecommendationRepository(self.client).create(
            user_id,
            analysis_id,
            single_candidate_id,
            result.model_dump(),
        )
        return RecommendationResponse.model_validate(row)

    def save_feedback(
        self, user_id: UUID, recommendation_id: UUID, values: dict[str, Any]
    ) -> dict[str, Any]:
        repository = RecommendationRepository(self.client)
        if repository.get(user_id, recommendation_id) is None:
            raise AppError("RESOURCE_NOT_FOUND", "추천 기록을 찾을 수 없습니다.", 404)
        return repository.save_feedback(user_id, recommendation_id, values)

    async def create_alternative(
        self, user_id: UUID, recommendation_id: UUID
    ) -> RecommendationResponse:
        repository = RecommendationRepository(self.client)
        original = repository.get(user_id, recommendation_id)
        if original is None:
            raise AppError("RESOURCE_NOT_FOUND", "추천 기록을 찾을 수 없습니다.", 404)
        negative_feedback = repository.get_latest_negative_feedback(
            user_id, recommendation_id
        )
        if negative_feedback is None:
            raise AppError(
                "VALIDATION_ERROR",
                "부정적 피드백을 남긴 추천만 대안으로 바꿀 수 있습니다.",
                409,
            )
        profile = ProfileRepository(self.client).get(user_id) or {}
        recent_feedback = repository.list_recent_feedback(user_id)
        result = await self.openai_service.create_alternative(
            {
                "original_recommendation": {
                    "action": original.get("action"),
                    "reason": original.get("reason"),
                    "duration_minutes": original.get("duration_minutes"),
                },
                "negative_feedback_reason": negative_feedback.get("reason"),
                "learned_preferences": _feedback_preferences(recent_feedback),
                "special_notes": profile.get("special_notes"),
                "special_notes_classification": profile.get(
                    "special_notes_classification", []
                ),
            }
        )
        row = repository.create(
            user_id,
            UUID(str(original["analysis_id"])),
            UUID(str(original["candidate_id"])) if original.get("candidate_id") else None,
            result.model_dump(),
        )
        return RecommendationResponse.model_validate(row)
