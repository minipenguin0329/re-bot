from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.exceptions import AppError
from app.main import app
from app.services.openai_service import get_openai_service
from tests.conftest import USER_A, USER_B, FakeDatabase


def _analysis(fake_db: FakeDatabase, *, user_id=USER_A, status="completed") -> str:
    now = datetime.now(timezone.utc).isoformat()
    symptom_id = str(uuid4())
    analysis_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(user_id),
            "category": "sleep",
            "description": "요즘 아침에 피곤해요.",
            "is_repeated": True,
            "image_path": None,
            "created_at": now,
        }
    ]
    fake_db.tables["analyses"] = [
        {
            "id": analysis_id,
            "user_id": str(user_id),
            "symptom_id": symptom_id,
            "status": status,
            "model_name": "test-model",
            "selection_status": "unselected",
            "created_at": now,
        }
    ]
    return analysis_id


def test_chat_reply_saves_user_and_assistant_messages_as_one_turn(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = _analysis(fake_db)

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/chat",
        json={"content": "  무엇부터 확인할까요?  "},
    )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["analysis_id"] == analysis_id
    assert body["user_message"]["content"] == "무엇부터 확인할까요?"
    assert body["assistant_message"]["role"] == "assistant"
    assert body["user_message"]["turn_id"] == body["assistant_message"]["turn_id"]
    assert [row["role"] for row in fake_db.tables["chat_messages"]] == [
        "user",
        "assistant",
    ]
    assert fake_db.tables["chat_messages"][1]["model_name"] == "test-model"


def test_chat_history_returns_messages_for_analysis(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = _analysis(fake_db)
    authenticated_client.post(
        f"/api/analysis/{analysis_id}/chat", json={"content": "첫 질문"}
    )

    response = authenticated_client.get(f"/api/analysis/{analysis_id}/chat")

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["analysis_id"] == analysis_id
    assert [item["role"] for item in body["messages"]] == ["user", "assistant"]


def test_chat_is_not_available_for_incomplete_analysis(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = _analysis(fake_db, status="pending")

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/chat", json={"content": "질문"}
    )

    assert response.status_code == 409, response.text
    assert response.json()["error"]["code"] == "CHAT_NOT_AVAILABLE"
    assert fake_db.tables.get("chat_messages", []) == []


def test_chat_cannot_access_another_users_analysis(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = _analysis(fake_db, user_id=USER_B)

    response = authenticated_client.get(f"/api/analysis/{analysis_id}/chat")

    assert response.status_code == 404, response.text


def test_chat_rejects_blank_message(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    analysis_id = _analysis(fake_db)

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/chat", json={"content": "   "}
    )

    assert response.status_code == 422, response.text
    assert fake_db.tables.get("chat_messages", []) == []


def test_chat_does_not_save_partial_turn_when_ai_fails(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    class FailingChatOpenAIService:
        model_name = "test-model"

        async def create_chat_reply(self, _: dict[str, object]) -> None:
            raise AppError("AI_ANALYSIS_FAILED", "AI 답변을 생성하지 못했습니다.", 502)

    analysis_id = _analysis(fake_db)
    app.dependency_overrides[get_openai_service] = lambda: FailingChatOpenAIService()

    response = authenticated_client.post(
        f"/api/analysis/{analysis_id}/chat", json={"content": "질문"}
    )

    assert response.status_code == 502, response.text
    assert fake_db.tables.get("chat_messages", []) == []
