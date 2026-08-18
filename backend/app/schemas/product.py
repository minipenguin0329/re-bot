from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict


class ProductResponse(BaseModel):
    id: UUID
    name: str
    category: str
    description: str | None = None
    image_url: str | None = None
    purchase_url: AnyHttpUrl | None = None
    tags: list[str]
    price_krw: int | None = None
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
