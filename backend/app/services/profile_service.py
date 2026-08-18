import logging
from typing import Any
from uuid import UUID

from supabase import Client

from app.core.exceptions import AppError
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


class ProfileService:
    def __init__(self, client: Client, openai_service: OpenAIService) -> None:
        self.repository = ProfileRepository(client)
        self.openai_service = openai_service

    async def _values_with_classification(
        self, values: dict[str, Any]
    ) -> dict[str, Any]:
        if "special_notes" not in values:
            return values

        special_notes = values["special_notes"]
        if special_notes:
            # 분류는 참고용 부가 기능이라, AI 장애로 인해 프로필 저장 자체가 막히면 안 됩니다.
            try:
                result = await self.openai_service.classify_special_notes(special_notes)
                values["special_notes_classification"] = [
                    item.model_dump() for item in result.items
                ]
            except AppError as exc:
                logger.warning("special_notes classification failed: %s", exc.message)
                values.pop("special_notes_classification", None)
        else:
            values["special_notes_classification"] = []
        return values

    async def create(self, user_id: UUID, payload: ProfileCreate) -> dict[str, Any]:
        values = await self._values_with_classification(
            payload.model_dump(exclude_unset=True)
        )
        return self.repository.upsert(user_id, values)

    async def update(
        self, user_id: UUID, payload: ProfileUpdate
    ) -> dict[str, Any] | None:
        values = payload.model_dump(exclude_unset=True)
        current = self.repository.get(user_id)
        if current is None:
            return None
        if (
            "special_notes" in values
            and values["special_notes"] == current.get("special_notes")
        ):
            values.pop("special_notes")
        values = await self._values_with_classification(values)
        if not values:
            return current
        return self.repository.update(user_id, values)
