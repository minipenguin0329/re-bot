from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import USER_B, FakeDatabase


def test_private_api_rejects_unauthenticated_user() -> None:
    response = TestClient(app).get("/api/logs")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTH_REQUIRED"


def test_user_cannot_read_another_users_daily_log(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    log_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    fake_db.tables["daily_logs"] = [
        {
            "id": log_id,
            "user_id": str(USER_B),
            "date": "2026-08-08",
            "sleep_hours": 7,
            "sleep_irregular": False,
            "breakfast": True,
            "created_at": now,
            "updated_at": now,
        }
    ]

    response = authenticated_client.get(f"/api/logs/{log_id}")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RESOURCE_NOT_FOUND"


def test_user_cannot_read_another_users_symptom(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    symptom_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_B),
            "category": "skin",
            "description": "private",
            "is_repeated": False,
            "image_path": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.get(f"/api/symptoms/{symptom_id}")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RESOURCE_NOT_FOUND"


def test_sleep_hours_validation(authenticated_client: TestClient) -> None:
    for invalid_value in (-0.1, 24.1):
        response = authenticated_client.post(
            "/api/logs", json={"sleep_hours": invalid_value}
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_caffeine_count_validation(authenticated_client: TestClient) -> None:
    for invalid_value in (-1, 101):
        response = authenticated_client.post(
            "/api/logs", json={"caffeine_count": invalid_value}
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"

