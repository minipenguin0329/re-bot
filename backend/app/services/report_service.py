from datetime import date, timedelta
from statistics import mean
from typing import Any, Literal
from uuid import UUID

from supabase import Client

from app.repositories.log_repository import LogRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.symptom_repository import SymptomRepository
from app.schemas.report import ReportResponse, ReportStatistics
from app.services.openai_service import OpenAIService

PeriodType = Literal["weekly", "monthly"]
LATE_MEAL_TERMS = ("야식", "늦은 식사", "밤참", "late meal", "midnight snack")


def calculate_statistics(
    logs: list[dict[str, Any]], symptom_count: int
) -> ReportStatistics:
    sleep_values = [float(log["sleep_hours"]) for log in logs if log.get("sleep_hours") is not None]
    stress_values = [
        float(log["stress_level"]) for log in logs if log.get("stress_level") is not None
    ]
    exercise_days = sum(1 for log in logs if (log.get("exercise_minutes") or 0) > 0)
    late_meal_count = sum(
        1
        for log in logs
        if any(term in str(log.get("meal_note") or "").lower() for term in LATE_MEAL_TERMS)
    )
    return ReportStatistics(
        recorded_days=len(logs),
        average_sleep_hours=round(mean(sleep_values), 2) if sleep_values else None,
        average_stress_level=round(mean(stress_values), 2) if stress_values else None,
        exercise_days=exercise_days,
        symptom_count=symptom_count,
        late_meal_count=late_meal_count,
    )


def period_dates(period_type: PeriodType, today: date | None = None) -> tuple[date, date]:
    end_date = today or date.today()
    if period_type == "weekly":
        return end_date - timedelta(days=6), end_date
    return end_date.replace(day=1), end_date


class ReportService:
    def __init__(self, client: Client, openai_service: OpenAIService) -> None:
        self.client = client
        self.openai_service = openai_service

    async def generate(self, user_id: UUID, period_type: PeriodType) -> ReportResponse:
        start_date, end_date = period_dates(period_type)
        logs = LogRepository(self.client).list_period(user_id, start_date, end_date)
        symptom_count = SymptomRepository(self.client).count_period(
            user_id, start_date, end_date
        )
        statistics = calculate_statistics(logs, symptom_count)
        # OpenAI explains server-calculated numbers; it does not calculate them.
        summary = await self.openai_service.create_report(
            {
                "period_type": period_type,
                "period_start": start_date,
                "period_end": end_date,
                "statistics": statistics.model_dump(),
            }
        )
        row = ReportRepository(self.client).save(
            user_id,
            period_type,
            start_date,
            end_date,
            statistics.model_dump(),
            summary.model_dump(),
        )
        return ReportResponse.model_validate(row)

