from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    CandidateSelectionRequest,
    CandidateSelectionResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.openai_service import OpenAIService, get_openai_service

router = APIRouter(prefix="/analysis", tags=["analysis"])
OpenAIServiceDependency = Annotated[OpenAIService, Depends(get_openai_service)]


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    payload: AnalysisCreate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> AnalysisResponse:
    return await AnalysisService(client, openai_service).analyze(
        user.id, payload.symptom_id
    )


@router.post("/{analysis_id}/select", response_model=CandidateSelectionResponse)
async def select_candidate(
    analysis_id: UUID,
    payload: CandidateSelectionRequest,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> CandidateSelectionResponse:
    row = AnalysisService(client, openai_service).select_candidate(
        user.id, analysis_id, payload.candidate_id
    )
    return CandidateSelectionResponse(
        analysis_id=analysis_id,
        selection_status=row["selection_status"],
        selected_candidate_id=row.get("selected_candidate_id"),
    )

