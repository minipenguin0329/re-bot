from typing import Annotated, Literal

from fastapi import APIRouter, Depends

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.schemas.report import ReportResponse
from app.services.openai_service import OpenAIService, get_openai_service
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])
OpenAIServiceDependency = Annotated[OpenAIService, Depends(get_openai_service)]


async def _generate_report(
    period_type: Literal["weekly", "monthly"],
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ReportResponse:
    return await ReportService(client, openai_service).generate(user.id, period_type)


@router.get("/weekly", response_model=ReportResponse)
async def weekly_report(
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ReportResponse:
    return await _generate_report("weekly", user, client, openai_service)


@router.get("/monthly", response_model=ReportResponse)
async def monthly_report(
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ReportResponse:
    return await _generate_report("monthly", user, client, openai_service)

