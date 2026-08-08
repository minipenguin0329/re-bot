from fastapi import APIRouter, Query

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.exceptions import AppError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/products", tags=["products"])
ALLOWED_PRODUCT_TAGS = {"sleep", "exercise", "hydration", "desk_environment"}


def _require_consent(consent: bool) -> None:
    if not consent:
        raise AppError(
            "PRODUCT_CONSENT_REQUIRED",
            "제품 정보 제공에 동의한 경우에만 조회할 수 있습니다.",
            403,
        )


@router.get("", response_model=list[ProductResponse])
async def list_products(
    user: AuthenticatedUser,
    client: DatabaseClient,
    consent: bool = Query(default=False),
) -> list[ProductResponse]:
    _require_consent(consent)
    return [
        ProductResponse.model_validate(row)
        for row in ProductRepository(client).list_active()
    ]


@router.get("/search", response_model=list[ProductResponse])
async def search_products(
    user: AuthenticatedUser,
    client: DatabaseClient,
    q: str = Query(min_length=1, max_length=100),
    consent: bool = Query(default=False),
) -> list[ProductResponse]:
    _require_consent(consent)
    return [
        ProductResponse.model_validate(row)
        for row in ProductRepository(client).search(q)
    ]


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
    return [ProductResponse.model_validate(row) for row in rows]

