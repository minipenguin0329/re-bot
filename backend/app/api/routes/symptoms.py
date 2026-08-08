from uuid import UUID

from fastapi import APIRouter, File, Response, UploadFile, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.config import get_settings
from app.core.exceptions import AppError
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.symptom import ImageUploadResponse, SymptomCreate, SymptomResponse
from app.services.storage_service import StorageService

router = APIRouter(prefix="/symptoms", tags=["symptoms"])


@router.post("", response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    payload: SymptomCreate, user: AuthenticatedUser, client: DatabaseClient
) -> SymptomResponse:
    row = SymptomRepository(client).create(user.id, payload.model_dump())
    return SymptomResponse.model_validate(row)


@router.get("", response_model=list[SymptomResponse])
async def list_symptoms(
    user: AuthenticatedUser, client: DatabaseClient
) -> list[SymptomResponse]:
    rows = SymptomRepository(client).list(user.id)
    return [SymptomResponse.model_validate(row) for row in rows]


@router.get("/{symptom_id}", response_model=SymptomResponse)
async def get_symptom(
    symptom_id: UUID, user: AuthenticatedUser, client: DatabaseClient
) -> SymptomResponse:
    row = SymptomRepository(client).get(user.id, symptom_id)
    if row is None:
        raise AppError("RESOURCE_NOT_FOUND", "증상 기록을 찾을 수 없습니다.", 404)
    return SymptomResponse.model_validate(row)


@router.post("/{symptom_id}/image", response_model=ImageUploadResponse)
async def upload_symptom_image(
    symptom_id: UUID,
    user: AuthenticatedUser,
    client: DatabaseClient,
    file: UploadFile = File(...),
) -> ImageUploadResponse:
    repository = SymptomRepository(client)
    symptom = repository.get(user.id, symptom_id)
    if symptom is None:
        raise AppError("RESOURCE_NOT_FOUND", "증상 기록을 찾을 수 없습니다.", 404)
    if symptom.get("image_path"):
        raise AppError("VALIDATION_ERROR", "이미지가 이미 등록되어 있습니다.", 409)

    storage = StorageService(client, get_settings())
    image_path = await storage.upload_symptom_image(user.id, file)
    updated = repository.set_image_path(user.id, symptom_id, image_path)
    if updated is None:
        storage.remove(image_path)
        raise AppError("RESOURCE_NOT_FOUND", "증상 기록을 찾을 수 없습니다.", 404)
    return ImageUploadResponse(image_path=image_path)


@router.delete("/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom(
    symptom_id: UUID, user: AuthenticatedUser, client: DatabaseClient
) -> Response:
    if not SymptomRepository(client).delete(user.id, symptom_id):
        raise AppError("RESOURCE_NOT_FOUND", "증상 기록을 찾을 수 없습니다.", 404)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
