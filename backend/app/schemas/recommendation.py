from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RecommendationResult(BaseModel):
    action: Annotated[str, Field(min_length=1, max_length=1000)]
    reason: Annotated[str, Field(min_length=1, max_length=1500)]
    duration_minutes: int | None = Field(default=None, ge=1, le=1440)
    difficulty: Literal["easy", "medium", "hard"] | None = None
    alternative: Annotated[str, Field(max_length=1000)] | None = None

    model_config = ConfigDict(extra="forbid")


class RecommendationCreate(BaseModel):
    analysis_id: UUID


class RecommendationResponse(RecommendationResult):
    id: UUID
    user_id: UUID
    analysis_id: UUID
    candidate_id: UUID | None = None
    created_at: datetime


class FeedbackCreate(BaseModel):
    feedback: Literal["positive", "negative"]
    reason: Annotated[str, Field(min_length=1, max_length=1000)] | None = None

    @model_validator(mode="after")
    def negative_feedback_should_explain_when_possible(self) -> "FeedbackCreate":
        # A reason is recommended but not forced because the product flow allows
        # a quick thumbs-down action.
        return self


class FeedbackResponse(BaseModel):
    id: UUID
    user_id: UUID
    recommendation_id: UUID
    feedback: Literal["positive", "negative"]
    reason: str | None = None
    created_at: datetime

