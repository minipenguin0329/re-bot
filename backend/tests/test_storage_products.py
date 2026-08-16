from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from tests.conftest import USER_A, FakeDatabase


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
            "purchase_url": None,
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
