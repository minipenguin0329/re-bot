import logging
from typing import Any

from fastapi import APIRouter, Query
from pydantic import ValidationError

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.exceptions import AppError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/products", tags=["products"])
ALLOWED_PRODUCT_TAGS = {"sleep", "exercise", "hydration", "desk_environment"}


def _require_consent(consent: bool) -> None:
    if not consent:
        raise AppError(
            "PRODUCT_CONSENT_REQUIRED",
            "제품 정보 제공에 동의한 경우에만 조회할 수 있습니다.",
            403,
        )


def _validate_products(rows: list[dict[str, Any]]) -> list[ProductResponse]:
    # 상품 하나의 데이터(예: 잘못된 purchase_url)가 잘못됐다고 목록 전체 조회가 죽으면 안 되므로,
    # 문제가 있는 행은 건너뛰고 나머지는 정상적으로 반환합니다.
    products: list[ProductResponse] = []
    for row in rows:
        try:
            products.append(ProductResponse.model_validate(row))
        except ValidationError:
            logger.warning("Skipping invalid product row id=%s", row.get("id"))
    return products


@router.get("", response_model=list[ProductResponse])
async def list_products(
    user: AuthenticatedUser,
    client: DatabaseClient,
    consent: bool = Query(default=False),
) -> list[ProductResponse]:
    _require_consent(consent)
    return _validate_products(ProductRepository(client).list_active())


@router.get("/search", response_model=list[ProductResponse])
async def search_products(
    user: AuthenticatedUser,
    client: DatabaseClient,
    q: str = Query(min_length=1, max_length=100),
    consent: bool = Query(default=False),
) -> list[ProductResponse]:
    _require_consent(consent)
    return _validate_products(ProductRepository(client).search(q))


@router.get("/recommended", response_model=list[ProductResponse])
async def recommended_products(
    user: AuthenticatedUser,
    client: DatabaseClient,
    tags: str = Query(
        min_length=1,
        description="Comma-separated internal tags: sleep, exercise, hydration, desk_environment",
    ),
    consent: bool = Query(default=False),
) -> list[ProductResponse]:
    _require_consent(consent)
    requested_tags = {tag.strip() for tag in tags.split(",") if tag.strip()}
    if not requested_tags or not requested_tags.issubset(ALLOWED_PRODUCT_TAGS):
        raise AppError("VALIDATION_ERROR", "지원하지 않는 제품 태그가 포함되어 있습니다.", 422)
    rows = ProductRepository(client).recommended(sorted(requested_tags))
    return _validate_products(rows)

