from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

ShortText = Annotated[str, Field(min_length=1, max_length=100)]


class ProfileBase(BaseModel):
    nickname: ShortText | None = None
    job: ShortText | None = None
    birth_year: int | None = None
    gender: Annotated[str, Field(max_length=30)] | None = None
    average_sleep_hours: float | None = Field(default=None, ge=0, le=24)

    @field_validator("birth_year")
    @classmethod
    def validate_birth_year(cls, value: int | None) -> int | None:
        if value is not None and not 1900 <= value <= datetime.now().year:
            raise ValueError("birth_year must be between 1900 and the current year")
        return value


class ProfileCreate(ProfileBase):
    nickname: ShortText


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    id: UUID
    email: str | None = None
    profile: ProfileResponse | None = None

