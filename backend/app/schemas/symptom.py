from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SymptomCreate(BaseModel):
    category: Annotated[str, Field(min_length=1, max_length=100)]
    description: Annotated[str, Field(min_length=1, max_length=4000)]
    is_repeated: bool = False


class SymptomResponse(SymptomCreate):
    id: UUID
    user_id: UUID
    image_path: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImageUploadResponse(BaseModel):
    image_path: str

