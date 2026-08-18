from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

ShortText = Annotated[str, Field(min_length=1, max_length=100)]


class SpecialNoteItem(BaseModel):
    category: Literal[
        "health_condition",
        "allergy",
        "medication",
        "dietary_restriction",
        "other",
    ]
    detail: Annotated[str, Field(min_length=1, max_length=500)]

    model_config = ConfigDict(extra="forbid")


class SpecialNotesClassification(BaseModel):
    items: Annotated[list[SpecialNoteItem], Field(max_length=20)]

    model_config = ConfigDict(extra="forbid")


class ProfileBase(BaseModel):
    nickname: ShortText | None = None
    job: ShortText | None = None
    birth_year: int | None = None
    gender: Annotated[str, Field(max_length=30)] | None = None
    average_sleep_hours: float | None = Field(default=None, ge=0, le=24)
    # Legacy fields remain readable for profiles created before special_notes.
    known_conditions: Annotated[str, Field(max_length=2000)] | None = None
    allergies: Annotated[str, Field(max_length=2000)] | None = None
    special_notes: Annotated[str, Field(max_length=4000)] | None = None

    @field_validator("birth_year")
    @classmethod
    def validate_birth_year(cls, value: int | None) -> int | None:
        if value is not None and not 1900 <= value <= datetime.now().year:
            raise ValueError("birth_year must be between 1900 and the current year")
        return value

    @field_validator("special_notes")
    @classmethod
    def normalize_special_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class ProfileCreate(ProfileBase):
    nickname: ShortText


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: UUID
    special_notes_classification: list[SpecialNoteItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    id: UUID
    email: str | None = None
    profile: ProfileResponse | None = None
