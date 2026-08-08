from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.core.exceptions import AppError
from app.repositories.log_repository import LogRepository
from app.schemas.daily_log import DailyLogCreate, DailyLogResponse, DailyLogUpdate

router = APIRouter(prefix="/logs", tags=["daily logs"])


@router.post("", response_model=DailyLogResponse, status_code=status.HTTP_201_CREATED)
async def create_log(
    payload: DailyLogCreate, user: AuthenticatedUser, client: DatabaseClient
) -> DailyLogResponse:
    row = LogRepository(client).create(user.id, payload.model_dump(mode="json"))
    return DailyLogResponse.model_validate(row)


@router.get("", response_model=list[DailyLogResponse])
async def list_logs(
    user: AuthenticatedUser,
    client: DatabaseClient,
    days: int | None = Query(default=None, ge=1, le=365),
) -> list[DailyLogResponse]:
    rows = LogRepository(client).list(user.id, days)
    return [DailyLogResponse.model_validate(row) for row in rows]


@router.get("/{log_id}", response_model=DailyLogResponse)
async def get_log(
    log_id: UUID, user: AuthenticatedUser, client: DatabaseClient
) -> DailyLogResponse:
    row = LogRepository(client).get(user.id, log_id)
    if row is None:
        raise AppError("RESOURCE_NOT_FOUND", "생활 기록을 찾을 수 없습니다.", 404)
    return DailyLogResponse.model_validate(row)


@router.patch("/{log_id}", response_model=DailyLogResponse)
async def update_log(
    log_id: UUID,
    payload: DailyLogUpdate,
    user: AuthenticatedUser,
    client: DatabaseClient,
) -> DailyLogResponse:
    values = payload.model_dump(mode="json", exclude_unset=True)
    if not values:
        raise AppError("VALIDATION_ERROR", "수정할 생활 기록 값이 없습니다.", 422)
    row = LogRepository(client).update(user.id, log_id, values)
    if row is None:
        raise AppError("RESOURCE_NOT_FOUND", "생활 기록을 찾을 수 없습니다.", 404)
    return DailyLogResponse.model_validate(row)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    log_id: UUID, user: AuthenticatedUser, client: DatabaseClient
) -> Response:
    if not LogRepository(client).delete(user.id, log_id):
        raise AppError("RESOURCE_NOT_FOUND", "생활 기록을 찾을 수 없습니다.", 404)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

