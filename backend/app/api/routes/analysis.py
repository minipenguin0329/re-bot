from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisHistoryItem,
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


@router.get("", response_model=list[AnalysisHistoryItem])
async def list_analyses(
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> list[AnalysisHistoryItem]:
    return AnalysisService(client, openai_service).list_history(user.id)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: UUID,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> AnalysisResponse:
    return AnalysisService(client, openai_service).get_detail(user.id, analysis_id)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: UUID,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> None:
    AnalysisService(client, openai_service).delete_history(user.id, analysis_id)


@router.post("/{analysis_id}/select", response_model=CandidateSelectionResponse)
async def select_candidate(
    analysis_id: UUID,
    payload: CandidateSelectionRequest,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> CandidateSelectionResponse:
    row, custom_candidate_id = AnalysisService(client, openai_service).select_candidates(
        user.id, analysis_id, payload.candidate_ids, payload.custom_cause
    )
    return CandidateSelectionResponse(
        analysis_id=analysis_id,
        selection_status=row["selection_status"],
        selected_candidate_ids=payload.candidate_ids,
        custom_candidate_id=custom_candidate_id,
    )

