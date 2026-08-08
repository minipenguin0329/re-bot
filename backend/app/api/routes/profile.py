from fastapi import APIRouter, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.exceptions import AppError
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import (
    MeResponse,
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)

router = APIRouter(tags=["profile"])


@router.get("/me", response_model=MeResponse)
async def get_me(user: AuthenticatedUser, client: DatabaseClient) -> MeResponse:
    profile = ProfileRepository(client).get(user.id)
    return MeResponse(
        id=user.id,
        email=user.email,
        profile=ProfileResponse.model_validate(profile) if profile else None,
    )


@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: ProfileCreate, user: AuthenticatedUser, client: DatabaseClient
) -> ProfileResponse:
    row = ProfileRepository(client).upsert(
        user.id, payload.model_dump(exclude_unset=True)
    )
    return ProfileResponse.model_validate(row)


@router.patch("/profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate, user: AuthenticatedUser, client: DatabaseClient
) -> ProfileResponse:
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise AppError("VALIDATION_ERROR", "수정할 프로필 값이 없습니다.", 422)
    row = ProfileRepository(client).update(user.id, values)
    if row is None:
        raise AppError("RESOURCE_NOT_FOUND", "프로필을 찾을 수 없습니다.", 404)
    return ProfileResponse.model_validate(row)

