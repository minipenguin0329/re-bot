from datetime import datetime

from pydantic import BaseModel, Field


class SymptomFrequency(BaseModel):
    symptom_name: str
    occurrence_count: int = Field(ge=1)
    last_occurred_at: datetime
    repeated_marked: bool = False


class WellnessProfileResponse(BaseModel):
    known_conditions: str | None = None
    allergies: str | None = None
    symptom_frequencies: list[SymptomFrequency]
    total_symptom_records: int = Field(ge=0)
    period_start: datetime | None = None
    period_end: datetime | None = None
    last_aggregated_at: datetime
    medical_guidance_recommended: bool = False
