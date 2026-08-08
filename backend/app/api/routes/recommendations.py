from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.schemas.recommendation import (
    FeedbackCreate,
    FeedbackResponse,
    RecommendationCreate,
    RecommendationResponse,
)
from app.services.openai_service import OpenAIService, get_openai_service
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
OpenAIServiceDependency = Annotated[OpenAIService, Depends(get_openai_service)]


@router.post("", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    payload: RecommendationCreate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> RecommendationResponse:
    return await RecommendationService(client, openai_service).create(
        user.id, payload.analysis_id
    )


@router.post(
    "/{recommendation_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
async def save_feedback(
    recommendation_id: UUID,
    payload: FeedbackCreate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> FeedbackResponse:
    row = RecommendationService(client, openai_service).save_feedback(
        user.id, recommendation_id, payload.model_dump()
    )
    return FeedbackResponse.model_validate(row)


@router.post(
    "/{recommendation_id}/alternative",
    response_model=RecommendationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_alternative(
    recommendation_id: UUID,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> RecommendationResponse:
    return await RecommendationService(client, openai_service).create_alternative(
        user.id, recommendation_id
    )

