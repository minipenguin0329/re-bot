from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProductResponse(BaseModel):
    id: UUID
    name: str
    category: str
    description: str | None = None
    image_url: str | None = None
    purchase_url: str | None = None
    tags: list[str]
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

