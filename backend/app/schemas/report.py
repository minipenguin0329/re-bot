from datetime import date, datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReportStatistics(BaseModel):
    recorded_days: int = Field(ge=0)
    average_sleep_hours: float | None = Field(default=None, ge=0, le=24)
    average_stress_level: float | None = Field(default=None, ge=1, le=5)
    exercise_days: int = Field(ge=0)
    symptom_count: int = Field(ge=0)
    late_meal_count: int = Field(ge=0)


class ReportSummary(BaseModel):
    overview: Annotated[str, Field(min_length=1, max_length=2000)]
    observations: Annotated[list[str], Field(max_length=5)]
    disclaimer: Annotated[str, Field(min_length=1, max_length=1000)]

    model_config = ConfigDict(extra="forbid")


class ReportResponse(BaseModel):
    id: UUID
    user_id: UUID
    period_type: Literal["weekly", "monthly"]
    period_start: date
    period_end: date
    statistics: ReportStatistics
    summary: ReportSummary
    created_at: datetime

