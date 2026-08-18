from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.exceptions import AppError
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import (
    MeResponse,
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)
from app.schemas.wellness_profile import WellnessProfileResponse
from app.services.wellness_profile_service import WellnessProfileService
from app.services.openai_service import OpenAIService, get_openai_service
from app.services.profile_service import ProfileService

router = APIRouter(tags=["profile"])
OpenAIServiceDependency = Annotated[OpenAIService, Depends(get_openai_service)]


@router.get("/me", response_model=MeResponse)
async def get_me(user: AuthenticatedUser, client: DatabaseClient) -> MeResponse:
    profile = ProfileRepository(client).get(user.id)
    return MeResponse(
        id=user.id,
        email=user.email,
        profile=ProfileResponse.model_validate(profile) if profile else None,
    )


@router.get("/profile/wellness", response_model=WellnessProfileResponse)
async def get_wellness_profile(
    user: AuthenticatedUser, client: DatabaseClient
) -> WellnessProfileResponse:
    return WellnessProfileService(client).get(user.id)


@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: ProfileCreate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ProfileResponse:
    row = await ProfileService(client, openai_service).create(user.id, payload)
    return ProfileResponse.model_validate(row)


@router.patch("/profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ProfileResponse:
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise AppError("VALIDATION_ERROR", "수정할 프로필 값이 없습니다.", 422)
    row = await ProfileService(client, openai_service).update(user.id, payload)
    if row is None:
        raise AppError("RESOURCE_NOT_FOUND", "프로필을 찾을 수 없습니다.", 404)
    return ProfileResponse.model_validate(row)
