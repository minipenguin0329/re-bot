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
from app.schemas.recommendation import (
    RecommendationOption,
    RecommendationResult,
    SupportResource,
)
from app.services.openai_service import OpenAIService
from tests.conftest import USER_A, USER_B, FakeDatabase


def candidate(number: int = 1) -> CauseCandidate:
    return CauseCandidate(
        title=f"후보 {number}",
        reason="생활 기록에서 함께 확인해볼 수 있는 변화입니다.",
        evidence=["기록 근거"],
        confirmation_question="직접 느낀 변화와 비슷한가요?",
    )


def test_ai_candidates_allow_up_to_eight() -> None:
    result = CauseAnalysisResult(candidates=[candidate(i) for i in range(8)])
    assert len(result.candidates) == 8


def test_ai_candidates_cannot_exceed_eight() -> None:
    with pytest.raises(ValidationError):
        CauseAnalysisResult(candidates=[candidate(i) for i in range(9)])


def test_recommendations_cannot_exceed_five_including_alternative() -> None:
    with pytest.raises(ValidationError):
        RecommendationResult(
            action="첫 번째 해결책",
            reason="이유",
            alternative="대안",
            additional_solutions=[
                RecommendationOption(action=f"해결책 {index}", reason="이유")
                for index in range(4)
            ],
        )


def test_recommendation_support_resources_are_generic_and_limited() -> None:
    result = RecommendationResult(
        action="잠들기 전 조명을 낮추기",
        reason="취침 환경을 단순하게 조정할 수 있어요.",
        support_resources=[
            SupportResource(
                category="tool",
                name="따뜻한 색 조명",
                benefit="밝은 천장 조명 대신 편안한 취침 환경을 만드는 데 도움을 줄 수 있어요.",
                selection_tip="밝기 조절이 가능한지 확인하세요.",
            )
        ],
    )

    assert result.support_resources[0].category == "tool"
    assert result.support_resources[0].name == "따뜻한 색 조명"

    with pytest.raises(ValidationError):
        RecommendationResult(
            action="작은 행동",
            reason="이유",
            support_resources=[
                SupportResource(category="service", name=f"서비스 {index}", benefit="도움")
                for index in range(4)
            ],
        )


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
            "created_at": now,
        },
        {
            "id": other_analysis_id,
            "user_id": str(USER_B),
            "symptom_id": str(uuid4()),
            "status": "completed",
            "model_name": "test-model",
            "selection_status": "unselected",
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.get(f"/api/analysis/{analysis_id}")

    assert response.status_code == 404, response.text


def _completed_analysis_with_two_candidates(
    fake_db: FakeDatabase,
) -> tuple[str, str, str]:
    now = datetime.now(timezone.utc).isoformat()
    symptom_id = str(uuid4())
    analysis_id = str(uuid4())
    candidate_a_id = str(uuid4())
    candidate_b_id = str(uuid4())
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
            "created_at": now,
        }
    ]
    fake_db.tables["analysis_candidates"] = [
        {
            "id": candidate_a_id,
            "analysis_id": analysis_id,
            "rank": 1,
            "title": "수면 부족",
            "reason": "최근 수면 시간이 짧았어요.",
            "evidence": ["기록 근거"],
            "confirmation_question": "최근 잠이 부족했다고 느끼셨나요?",
            "created_at": now,
        },
        {
            "id": candidate_b_id,
            "analysis_id": analysis_id,
            "rank": 2,
            "title": "카페인 과다 섭취",
            "reason": "평소보다 커피를 더 마셨어요.",
            "evidence": ["기록 근거"],
            "confirmation_question": "카페인 섭취가 늘었나요?",
            "created_at": now,
        },
    ]
    return analysis_id, candidate_a_id, candidate_b_id


def test_select_multiple_candidates(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id, candidate_a_id, candidate_b_id = _completed_analysis_with_two_candidates(
        fake_db
    )

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/select",
        json={"candidate_ids": [candidate_a_id, candidate_b_id]},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["selection_status"] == "candidate"
    assert set(body["selected_candidate_ids"]) == {candidate_a_id, candidate_b_id}
    selected_flags = {
        row["id"]: row["selected"] for row in fake_db.tables["analysis_candidates"]
    }
    assert selected_flags[candidate_a_id] is True
    assert selected_flags[candidate_b_id] is True


def test_select_candidates_with_custom_cause(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id, candidate_a_id, _ = _completed_analysis_with_two_candidates(fake_db)

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/select",
        json={
            "candidate_ids": [candidate_a_id],
            "custom_cause": "최근 야근이 늘었어요",
        },
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["selection_status"] == "candidate"
    assert body["custom_candidate_id"]
    custom_rows = [
        row for row in fake_db.tables["analysis_candidates"] if row.get("is_custom")
    ]
    assert len(custom_rows) == 1
    assert custom_rows[0]["title"] == "최근 야근이 늘었어요"
    assert custom_rows[0]["selected"] is True


def test_selecting_none_clears_previous_selection(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id, candidate_a_id, _ = _completed_analysis_with_two_candidates(fake_db)
    authenticated_client.post(
        f"/api/analysis/{analysis_id}/select",
        json={"candidate_ids": [candidate_a_id]},
    )

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/select", json={"candidate_ids": []}
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["selection_status"] == "none"
    assert body["selected_candidate_ids"] == []
    assert all(
        row["selected"] is False for row in fake_db.tables["analysis_candidates"]
    )


def test_recommendation_combines_multiple_selected_candidates(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id, candidate_a_id, candidate_b_id = _completed_analysis_with_two_candidates(
        fake_db
    )
    authenticated_client.post(
        f"/api/analysis/{analysis_id}/select",
        json={"candidate_ids": [candidate_a_id, candidate_b_id]},
    )

    response = authenticated_client.post(
        "/api/recommendations", json={"analysis_id": analysis_id}
    )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["candidate_id"] is None
    assert body["action"]

