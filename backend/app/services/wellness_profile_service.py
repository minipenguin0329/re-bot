from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from supabase import Client

from app.repositories.profile_repository import ProfileRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.wellness_profile import SymptomFrequency, WellnessProfileResponse

MEDICAL_GUIDANCE_THRESHOLD = 3


def _parse_datetime(value: object) -> datetime:
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def _symptom_key(description: str) -> str:
    return re.sub(r"\s+", " ", description).strip().casefold()


def _symptom_label(description: str) -> str:
    normalized = re.sub(r"\s+", " ", description).strip()
    return normalized if len(normalized) <= 42 else f"{normalized[:41]}…"


def aggregate_symptoms(rows: list[dict[str, Any]]) -> list[SymptomFrequency]:
    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        description = str(row.get("description") or "").strip()
        if not description:
            continue
        occurred_at = _parse_datetime(row["created_at"])
        key = _symptom_key(description)
        current = grouped.get(key)
        if current is None:
            grouped[key] = {
                "symptom_name": _symptom_label(description),
                "occurrence_count": 1,
                "last_occurred_at": occurred_at,
                "repeated_marked": bool(row.get("is_repeated")),
            }
            continue
        current["occurrence_count"] += 1
        current["repeated_marked"] = current["repeated_marked"] or bool(
            row.get("is_repeated")
        )
        if occurred_at > current["last_occurred_at"]:
            current["last_occurred_at"] = occurred_at

    repeated = [
        SymptomFrequency.model_validate(item)
        for item in grouped.values()
        if item["occurrence_count"] >= 2 or item["repeated_marked"]
    ]
    repeated.sort(
        key=lambda item: (item.occurrence_count, item.last_occurred_at), reverse=True
    )
    return repeated


class WellnessProfileService:
    def __init__(self, client: Client) -> None:
        self.client = client

    def get(self, user_id: UUID) -> WellnessProfileResponse:
        profile = ProfileRepository(self.client).get(user_id)
        # AI 솔루션(이미 원인을 아는 상황) 기록은 대화 내역과 마찬가지로 반복 증상 집계에서도 제외합니다.
        symptoms = [
            item
            for item in SymptomRepository(self.client).list(user_id)
            if item.get("category") != "known_cause_situation"
        ]
        frequencies = aggregate_symptoms(symptoms)
        occurred_at = [
            _parse_datetime(item["created_at"])
            for item in symptoms
            if item.get("created_at")
        ]
        return WellnessProfileResponse(
            known_conditions=profile.get("known_conditions") if profile else None,
            allergies=profile.get("allergies") if profile else None,
            symptom_frequencies=frequencies,
            total_symptom_records=len(symptoms),
            period_start=min(occurred_at) if occurred_at else None,
            period_end=max(occurred_at) if occurred_at else None,
            last_aggregated_at=datetime.now(timezone.utc),
            medical_guidance_recommended=any(
                item.occurrence_count >= MEDICAL_GUIDANCE_THRESHOLD
                for item in frequencies
            ),
        )
