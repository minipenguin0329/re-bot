from datetime import datetime
from typing import Any
from uuid import UUID

from supabase import Client

from app.core.exceptions import AppError
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.log_repository import LogRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.analysis import AnalysisHistoryItem, AnalysisResponse, CauseAnalysisResult
from app.services.openai_service import OpenAIService


def _age_group(birth_year: int | None) -> str | None:
    if birth_year is None:
        return None
    age = max(0, datetime.now().year - birth_year)
    if age < 20:
        return "under_20"
    if age >= 60:
        return "60_plus"
    return f"{age // 10 * 10}s"


def _build_analysis_context(
    symptom: dict[str, Any],
    profile: dict[str, Any] | None,
    logs: list[dict[str, Any]],
    similar_symptoms: list[dict[str, Any]],
    feedback: list[dict[str, Any]],
) -> dict[str, object]:
    profile_context = {
        "age_group": _age_group(profile.get("birth_year") if profile else None),
        "job": profile.get("job") if profile else None,
        "gender": profile.get("gender") if profile else None,
        "usual_sleep_hours": profile.get("average_sleep_hours") if profile else None,
    }
    log_fields = (
        "date",
        "sleep_hours",
        "sleep_irregular",
        "stress_level",
        "exercise_minutes",
        "caffeine_count",
        "meal_note",
    )
    return {
        "user_profile": profile_context,
        "current_discomfort": {
            "category": symptom["category"],
            "description": symptom["description"],
            "is_repeated": symptom["is_repeated"],
        },
        "recent_daily_logs": [
            {field: log.get(field) for field in log_fields} for log in logs
        ],
        "similar_history": [
            {
                "category": item.get("category"),
                "is_repeated": item.get("is_repeated"),
                "created_at": item.get("created_at"),
            }
            for item in similar_symptoms
        ],
        "recent_recommendation_feedback": feedback,
    }


class AnalysisService:
    def __init__(self, client: Client, openai_service: OpenAIService) -> None:
        self.client = client
        self.openai_service = openai_service

    async def analyze(self, user_id: UUID, symptom_id: UUID) -> AnalysisResponse:
        symptom_repo = SymptomRepository(self.client)
        symptom = symptom_repo.get(user_id, symptom_id)
        if symptom is None:
            raise AppError("RESOURCE_NOT_FOUND", "증상 기록을 찾을 수 없습니다.", 404)

        profile = ProfileRepository(self.client).get(user_id)
        logs = LogRepository(self.client).list(user_id, days=14)
        similar = symptom_repo.list_similar(
            user_id, symptom["category"], symptom_id, limit=5
        )
        feedback = RecommendationRepository(self.client).list_recent_feedback(user_id)
        context = _build_analysis_context(symptom, profile, logs, similar, feedback)

        model_name = self.openai_service.model_name
        if not model_name:
            raise AppError(
                "AI_ANALYSIS_FAILED", "OPENAI_MODEL 환경변수가 설정되지 않았습니다.", 503
            )

        repository = AnalysisRepository(self.client)
        analysis = repository.create_pending(user_id, symptom_id, model_name)
        analysis_id = UUID(str(analysis["id"]))
        try:
            result: CauseAnalysisResult = await self.openai_service.analyze_causes(context)
            candidates = repository.save_candidates(analysis_id, result.candidates)
            repository.set_status(analysis_id, user_id, "completed")
        except AppError:
            repository.set_status(analysis_id, user_id, "failed")
            raise

        analysis["status"] = "completed"
        analysis["candidates"] = candidates
        return AnalysisResponse.model_validate(analysis)

    def list_history(self, user_id: UUID) -> list[AnalysisHistoryItem]:
        repository = AnalysisRepository(self.client)
        symptom_repo = SymptomRepository(self.client)
        recommendation_repo = RecommendationRepository(self.client)

        items: list[AnalysisHistoryItem] = []
        for analysis in repository.list(user_id):
            symptom = symptom_repo.get(user_id, UUID(str(analysis["symptom_id"])))
            recommendation = recommendation_repo.get_latest_by_analysis(
                user_id, UUID(str(analysis["id"]))
            )
            items.append(
                AnalysisHistoryItem(
                    id=analysis["id"],
                    symptom_id=analysis["symptom_id"],
                    symptom_description=symptom["description"] if symptom else "",
                    status=analysis["status"],
                    selection_status=analysis["selection_status"],
                    recommendation_action=(
                        recommendation["action"] if recommendation else None
                    ),
                    recommendation_created_at=(
                        recommendation["created_at"] if recommendation else None
                    ),
                    created_at=analysis["created_at"],
                )
            )
        return items

    def get_detail(self, user_id: UUID, analysis_id: UUID) -> AnalysisResponse:
        repository = AnalysisRepository(self.client)
        analysis = repository.get(user_id, analysis_id)
        if analysis is None:
            raise AppError("RESOURCE_NOT_FOUND", "분석 기록을 찾을 수 없습니다.", 404)
        analysis = {**analysis, "candidates": repository.list_candidates(analysis_id)}
        return AnalysisResponse.model_validate(analysis)

    def delete_history(self, user_id: UUID, analysis_id: UUID) -> None:
        if not AnalysisRepository(self.client).delete(user_id, analysis_id):
            raise AppError("RESOURCE_NOT_FOUND", "삭제할 분석 기록을 찾을 수 없습니다.", 404)

    def select_candidates(
        self,
        user_id: UUID,
        analysis_id: UUID,
        candidate_ids: list[UUID],
        custom_cause: str | None = None,
    ) -> tuple[dict[str, Any], UUID | None]:
        repository = AnalysisRepository(self.client)
        analysis = repository.get(user_id, analysis_id)
        if analysis is None:
            raise AppError("RESOURCE_NOT_FOUND", "분석 기록을 찾을 수 없습니다.", 404)
        if analysis.get("status") != "completed":
            raise AppError("VALIDATION_ERROR", "완료된 분석에서만 후보를 선택할 수 있습니다.", 409)
        for candidate_id in candidate_ids:
            if repository.get_candidate(analysis_id, candidate_id) is None:
                raise AppError(
                    "RESOURCE_FORBIDDEN", "이 분석에 속하지 않은 후보입니다.", 403
                )
        normalized_custom_cause = custom_cause.strip() if custom_cause else None
        custom_candidate = repository.replace_custom_candidate(
            analysis_id, normalized_custom_cause
        )
        selected_ids = list(candidate_ids)
        custom_candidate_id = None
        if custom_candidate:
            custom_candidate_id = UUID(str(custom_candidate["id"]))
            selected_ids.append(custom_candidate_id)

        updated = repository.select_candidates(user_id, analysis_id, selected_ids)
        if updated is None:
            raise AppError("RESOURCE_NOT_FOUND", "분석 기록을 찾을 수 없습니다.", 404)
        return updated, custom_candidate_id
