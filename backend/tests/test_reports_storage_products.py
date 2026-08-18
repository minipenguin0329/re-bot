from datetime import date, datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.services.report_service import calculate_statistics, period_dates
from tests.conftest import USER_A, FakeDatabase


def test_report_statistics_are_calculated_by_backend() -> None:
    statistics = calculate_statistics(
        [
            {
                "sleep_hours": 6,
                "stress_level": 2,
                "exercise_minutes": 0,
                "meal_note": "야식으로 라면",
            },
            {
                "sleep_hours": 8,
                "stress_level": 4,
                "exercise_minutes": 20,
                "meal_note": None,
            },
        ],
        symptom_count=3,
    )

    assert statistics.average_sleep_hours == 7
    assert statistics.average_stress_level == 3
    assert statistics.exercise_days == 1
    assert statistics.symptom_count == 3
    assert statistics.late_meal_count == 1


@pytest.mark.parametrize("period_type", ["weekly", "monthly"])
def test_report_endpoint_saves_server_calculated_statistics(
    period_type: str,
    authenticated_client: TestClient,
    fake_db: FakeDatabase,
) -> None:
    today = date.today()
    now = datetime.now(timezone.utc).isoformat()
    fake_db.tables["daily_logs"] = [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "date": today.isoformat(),
            "sleep_hours": 7,
            "sleep_irregular": False,
            "stress_level": 3,
            "exercise_minutes": 15,
            "meal_note": None,
            "created_at": now,
            "updated_at": now,
        }
    ]
    fake_db.tables["symptoms"] = [
        {
            "id": str(uuid4()),
            "user_id": str(USER_A),
            "category": "fatigue",
            "description": "피곤해요.",
            "is_repeated": False,
            "image_path": None,
            "created_at": now,
        }
    ]

    response = authenticated_client.get(f"/api/reports/{period_type}")

    assert response.status_code == 200, response.text
    assert response.json()["statistics"]["average_sleep_hours"] == 7
    assert response.json()["statistics"]["symptom_count"] == 1
    assert fake_db.tables["reports"][0]["period_start"] == period_dates(period_type)[0].isoformat()


def test_symptom_image_upload_uses_private_uuid_path(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    symptom_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_A),
            "category": "skin",
            "description": "이미지와 함께 기록",
            "is_repeated": False,
            "image_path": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.post(
        f"/api/symptoms/{symptom_id}/image",
        files={"file": ("original-name.png", b"small-image", "image/png")},
    )

    assert response.status_code == 200, response.text
    image_path = response.json()["image_path"]
    assert image_path.startswith(f"{USER_A}/")
    assert image_path.endswith(".png")
    assert "original-name" not in image_path
    assert image_path in fake_db.storage.files


def test_invalid_image_type_is_rejected(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    symptom_id = str(uuid4())
    fake_db.tables["symptoms"] = [
        {
            "id": symptom_id,
            "user_id": str(USER_A),
            "category": "skin",
            "description": "기록",
            "is_repeated": False,
            "image_path": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.post(
        f"/api/symptoms/{symptom_id}/image",
        files={"file": ("notes.txt", b"not-an-image", "text/plain")},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_IMAGE_TYPE"


def test_products_require_explicit_consent(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    response = authenticated_client.get("/api/products")

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "PRODUCT_CONSENT_REQUIRED"


def test_recommended_products_only_return_database_rows(
    authenticated_client: TestClient, fake_db: FakeDatabase
) -> None:
    product_id = str(uuid4())
    fake_db.tables["products"] = [
        {
            "id": product_id,
            "name": "물병",
            "category": "hydration",
            "description": "수분 섭취 기록용",
            "image_url": None,
            "purchase_url": "https://example.com/products/water-bottle",
            "tags": ["hydration"],
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    response = authenticated_client.get(
        "/api/products/recommended?tags=hydration&consent=true"
    )

    assert response.status_code == 200, response.text
    assert [item["id"] for item in response.json()] == [product_id]
    assert response.json()[0]["purchase_url"] == (
        "https://example.com/products/water-bottle"
    )
