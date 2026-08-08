from datetime import date as Date
from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

Note = Annotated[str, Field(max_length=2000)]


class DailyLogBase(BaseModel):
    date: Date = Field(default_factory=Date.today)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_irregular: bool = False
    stress_level: int | None = Field(default=None, ge=1, le=5)
    water_ml: int | None = Field(default=None, ge=0, le=20000)
    exercise_minutes: int | None = Field(default=None, ge=0, le=1440)
    caffeine_count: int | None = Field(default=None, ge=0, le=100)
    alcohol: bool | None = None
    meal_note: Note | None = None
    memo: Note | None = None


class DailyLogCreate(DailyLogBase):
    pass


class DailyLogUpdate(BaseModel):
    date: Date | None = None
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_irregular: bool | None = None
    stress_level: int | None = Field(default=None, ge=1, le=5)
    water_ml: int | None = Field(default=None, ge=0, le=20000)
    exercise_minutes: int | None = Field(default=None, ge=0, le=1440)
    caffeine_count: int | None = Field(default=None, ge=0, le=100)
    alcohol: bool | None = None
    meal_note: Note | None = None
    memo: Note | None = None


class DailyLogResponse(DailyLogBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
