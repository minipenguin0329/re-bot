from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import httpx
import openai
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.core.exceptions import AppError
from app.schemas.analysis import CauseAnalysisResult, CauseCandidate
from app.services.openai_service import OpenAIService
from tests.conftest import USER_A, USER_B, FakeDatabase


def candidate(number: int = 1) -> CauseCandidate:
    return CauseCandidate(
        title=f"후보 {number}",
        reason="생활 기록에서 함께 확인해볼 수 있는 변화입니다.",
        evidence=["기록 근거"],
        confirmation_question="직접 느낀 변화와 비슷한가요?",
    )


def test_ai_candidates_cannot_exceed_three() -> None:
    with pytest.raises(ValidationError):
        CauseAnalysisResult(candidates=[candidate(i) for i in range(4)])


class StubResponses:
    def __init__(self, output: object = None, error: Exception | None = None) -> None:
        self.output = output
        self.error = error

    async def parse(self, **_: object) -> SimpleNamespace:
        if self.error:
            raise self.error
        return SimpleNamespace(output_parsed=self.output)


class StubOpenAIClient:
    def __init__(self, responses: StubResponses) -> None:
        self.responses = responses


@pytest.mark.asyncio
async def test_malformed_ai_json_is_rejected() -> None:
    service = OpenAIService(
        Settings(openai_api_key="test", openai_model="test-model"),
        client=StubOpenAIClient(StubResponses(output="{not-valid-json")),  # type: ignore[arg-type]
    )

    with pytest.raises(AppError) as exc_info:
        await service.analyze_causes({})

    assert exc_info.value.code == "AI_INVALID_RESPONSE"


@pytest.mark.asyncio
async def test_openai_api_failure_is_mapped_to_safe_error() -> None:
    api_error = openai.APIConnectionError(
        request=httpx.Request("POST", "https://api.openai.com/v1/responses")
    )
    service = OpenAIService(
        Settings(openai_api_key="test", openai_model="test-model"),
        client=StubOpenAIClient(StubResponses(error=api_error)),  # type: ignore[arg-type]
    )

    with pytest.raises(AppError) as exc_info:
        await service.analyze_causes({})

    assert exc_info.value.code == "AI_ANALYSIS_FAILED"
    assert "api.openai.com" not in exc_info.value.message


def test_analysis_saves_structured_candidates(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    symptom_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_A),
            "category": "skin",
            "description": "최근 불편이 있어요.",
            "is_repeated": True,
            "image_path": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.post(
        "/api/analysis", json={"symptom_id": symptom_id}
    )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "completed"
    assert len(body["candidates"]) == 1
    assert len(fake_db.tables["analyses"]) == 1
    assert len(fake_db.tables["analysis_candidates"]) == 1


def test_negative_feedback_is_saved(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    recommendation_id = str(uuid4())
    fake_db.tables["recommendations"] = [
        {
            "id": recommendation_id,
            "user_id": str(USER_A),
            "analysis_id": str(uuid4()),
            "candidate_id": None,
            "action": "20분 산책",
            "reason": "작은 활동",
            "duration_minutes": 20,
            "difficulty": "easy",
            "alternative": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.post(
        f"/api/recommendations/{recommendation_id}/feedback",
        json={"feedback": "negative", "reason": "시간이 없어요."},
    )

    assert response.status_code == 201, response.text
    assert response.json()["feedback"] == "negative"
    assert fake_db.tables["recommendation_feedback"][0]["reason"] == "시간이 없어요."


def test_alternative_recommendation_flow(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    recommendation_id = str(uuid4())
    analysis_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    fake_db.tables["recommendations"] = [
        {
            "id": recommendation_id,
            "user_id": str(USER_A),
            "analysis_id": analysis_id,
            "candidate_id": None,
            "action": "퇴근 후 20분 산책",
            "reason": "활동량 확인",
            "duration_minutes": 20,
            "difficulty": "easy",
            "alternative": None,
            "created_at": now,
        }
    ]
    fake_db.tables["recommendation_feedback"] = [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "recommendation_id": recommendation_id,
            "feedback": "negative",
            "reason": "시간이 없어요.",
            "created_at": now,
        }
    ]

    response = authenticated_client.post(
        f"/api/recommendations/{recommendation_id}/alternative"
    )

    assert response.status_code == 201, response.text
    assert response.json()["duration_minutes"] == 1
    assert len(fake_db.tables["recommendations"]) == 2


def test_list_analyses_returns_history_scoped_to_user(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    symptom_id = str(uuid4())
    analysis_id = str(uuid4())
    other_analysis_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_A),
            "category": "skin",
            "description": "최근 두통이 있어요.",
            "is_repeated": False,
            "image_path": None,
            "created_at": now,
        }
    ]
    fake_db.tables["analyses"] = [
        {
            "id": analysis_id,
            "user_id": str(USER_A),
            "symptom_id": symptom_id,
            "status": "completed",
            "model_name": "test-model",
            "selection_status": "candidate",
            "selected_candidate_id": None,
            "created_at": now,
        },
        {
            "id": other_analysis_id,
            "user_id": str(USER_B),
            "symptom_id": str(uuid4()),
            "status": "completed",
            "model_name": "test-model",
            "selection_status": "unselected",
            "selected_candidate_id": None,
            "created_at": now,
        },
    ]
    fake_db.tables["recommendations"] = [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "analysis_id": analysis_id,
            "candidate_id": None,
            "action": "오늘 물 한 잔 더 마시기",
            "reason": "수분 섭취 확인",
            "duration_minutes": 1,
            "difficulty": "easy",
            "alternative": None,
            "created_at": now,
        }
    ]

    response = authenticated_client.get("/api/analysis")

    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == analysis_id
    assert body[0]["symptom_description"] == "최근 두통이 있어요."
    assert body[0]["recommendation_action"] == "오늘 물 한 잔 더 마시기"


def test_get_analysis_detail_returns_candidates(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    symptom_id = str(uuid4())
    analysis_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_A),
            "category": "skin",
            "description": "최근 두통이 있어요.",
            "is_repeated": False,
            "image_path": None,
            "created_at": now,
        }
    ]
    fake_db.tables["analyses"] = [
        {
            "id": analysis_id,
            "user_id": str(USER_A),
            "symptom_id": symptom_id,
            "status": "completed",
            "model_name": "test-model",
            "selection_status": "unselected",
            "selected_candidate_id": None,
            "created_at": now,
        }
    ]
    fake_db.tables["analysis_candidates"] = [
        {
            "id": str(uuid4()),
            "analysis_id": analysis_id,
            "rank": 1,
            "title": "수면 부족",
            "reason": "최근 수면 시간이 짧았어요.",
            "evidence": ["기록 근거"],
            "confirmation_question": "최근 잠이 부족했다고 느끼셨나요?",
            "created_at": now,
        }
    ]

    response = authenticated_client.get(f"/api/analysis/{analysis_id}")

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["id"] == analysis_id
    assert len(body["candidates"]) == 1
    assert body["candidates"][0]["title"] == "수면 부족"


def test_get_analysis_detail_404_for_other_user(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = str(uuid4())
    fake_db.tables["analyses"] = [
        {
            "id": analysis_id,
            "user_id": str(USER_B),
            "symptom_id": str(uuid4()),
            "status": "completed",
            "model_name": "test-model",
            "selection_status": "unselected",
            "selected_candidate_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.get(f"/api/analysis/{analysis_id}")

    assert response.status_code == 404, response.text

