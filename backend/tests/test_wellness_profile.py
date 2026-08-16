from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from tests.conftest import USER_A, FakeDatabase


def test_wellness_profile_returns_repeated_symptoms_and_health_context(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    now = datetime.now(timezone.utc)
    fake_db.tables["profiles"] = [
        {
            "id": str(USER_A),
            "nickname": "테스터",
            "known_conditions": "편두통",
            "allergies": "땅콩",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
    ]
    fake_db.tables["symptoms"] = [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "category": "general_discomfort",
            "description": "오후에 두통이 있었어요",
            "is_repeated": index > 0,
            "image_path": None,
            "created_at": (now - timedelta(days=index)).isoformat(),
        }
        for index in range(3)
    ] + [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "category": "general_discomfort",
            "description": "오늘만 손목이 불편해요",
            "is_repeated": False,
            "image_path": None,
            "created_at": now.isoformat(),
        }
    ]

    response = authenticated_client.get("/api/profile/wellness")

    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["known_conditions"] == "편두통"
    assert payload["allergies"] == "땅콩"
    assert payload["total_symptom_records"] == 4
    assert payload["medical_guidance_recommended"] is True
    assert payload["symptom_frequencies"] == [
        {
            "symptom_name": "오후에 두통이 있었어요",
            "occurrence_count": 3,
            "last_occurred_at": now.isoformat().replace("+00:00", "Z"),
            "repeated_marked": True,
        }
    ]


def test_wellness_profile_has_empty_state_without_records(
    authenticated_client: TestClient,
) -> None:
    response = authenticated_client.get("/api/profile/wellness")

    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["symptom_frequencies"] == []
    assert payload["total_symptom_records"] == 0
    assert payload["period_start"] is None
    assert payload["period_end"] is None
    assert payload["medical_guidance_recommended"] is False
