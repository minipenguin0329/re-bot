from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CauseCandidate(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    reason: Annotated[str, Field(min_length=1, max_length=1500)]
    evidence: Annotated[list[str], Field(max_length=10)]
    confirmation_question: Annotated[str, Field(min_length=1, max_length=500)]

    model_config = ConfigDict(extra="forbid")


class CauseAnalysisResult(BaseModel):
    candidates: Annotated[list[CauseCandidate], Field(max_length=8)]

    model_config = ConfigDict(extra="forbid")


class AnalysisCreate(BaseModel):
    symptom_id: UUID


class AnalysisCandidateResponse(CauseCandidate):
    id: UUID
    analysis_id: UUID
    rank: int = Field(ge=1, le=9)
    selected: bool = False
    is_custom: bool = False
    created_at: datetime


class AnalysisResponse(BaseModel):
    id: UUID
    user_id: UUID
    symptom_id: UUID
    status: Literal["pending", "completed", "failed"]
    model_name: str
    selection_status: Literal["unselected", "candidate", "none"]
    created_at: datetime
    candidates: list[AnalysisCandidateResponse]


class CandidateSelectionRequest(BaseModel):
    candidate_ids: Annotated[list[UUID], Field(default_factory=list, max_length=8)]
    custom_cause: Annotated[str, Field(min_length=1, max_length=500)] | None = None


class CandidateSelectionResponse(BaseModel):
    analysis_id: UUID
    selection_status: Literal["candidate", "none"]
    selected_candidate_ids: list[UUID] = []
    custom_candidate_id: UUID | None = None


class AnalysisHistoryItem(BaseModel):
    id: UUID
    symptom_id: UUID
    symptom_description: str
    status: Literal["pending", "completed", "failed"]
    selection_status: Literal["unselected", "candidate", "none"]
    recommendation_action: str | None = None
    recommendation_created_at: datetime | None = None
    created_at: datetime

