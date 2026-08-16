from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RecommendationOption(BaseModel):
    action: Annotated[str, Field(min_length=1, max_length=1000)]
    reason: Annotated[str, Field(min_length=1, max_length=1500)]
    duration_minutes: int | None = Field(default=None, ge=1, le=1440)
    difficulty: Literal["easy", "medium", "hard"] | None = None

    model_config = ConfigDict(extra="forbid")


class SupportResource(BaseModel):
    category: Literal["tool", "service"]
    name: Annotated[str, Field(min_length=1, max_length=200)]
    benefit: Annotated[str, Field(min_length=1, max_length=700)]
    selection_tip: Annotated[str, Field(max_length=700)] | None = None

    model_config = ConfigDict(extra="forbid")


class RecommendationResult(RecommendationOption):
    alternative: Annotated[str, Field(max_length=1000)] | None = None
    additional_solutions: Annotated[
        list[RecommendationOption], Field(default_factory=list, max_length=4)
    ]
    support_resources: Annotated[
        list[SupportResource], Field(default_factory=list, max_length=3)
    ]

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def solutions_cannot_exceed_five(self) -> "RecommendationResult":
        total = 1 + len(self.additional_solutions) + (1 if self.alternative else 0)
        if total > 5:
            raise ValueError("해결책은 대안을 포함해 최대 5개까지 생성할 수 있습니다.")
        return self


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

