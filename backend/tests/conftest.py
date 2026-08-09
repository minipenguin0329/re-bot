from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, Iterator
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_database_client
from app.core.security import CurrentUser, get_current_user
from app.main import app
from app.schemas.analysis import CauseAnalysisResult, CauseCandidate
from app.schemas.recommendation import RecommendationResult
from app.schemas.report import ReportSummary
from app.services.openai_service import get_openai_service

USER_A = UUID("11111111-1111-1111-1111-111111111111")
USER_B = UUID("22222222-2222-2222-2222-222222222222")


class FakeQuery:
    def __init__(self, database: "FakeDatabase", table: str) -> None:
        self.database = database
        self.table = table
        self.action = "select"
        self.payload: Any = None
        self.filters: list[tuple[str, str, Any]] = []
        self.ordering: tuple[str, bool] | None = None
        self.row_limit: int | None = None

    def select(self, *_: Any, **__: Any) -> "FakeQuery":
        return self

    def insert(self, payload: Any) -> "FakeQuery":
        self.action, self.payload = "insert", payload
        return self

    def upsert(self, payload: Any) -> "FakeQuery":
        self.action, self.payload = "upsert", payload
        return self

    def update(self, payload: Any) -> "FakeQuery":
        self.action, self.payload = "update", payload
        return self

    def delete(self) -> "FakeQuery":
        self.action = "delete"
        return self

    def eq(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append(("eq", column, value))
        return self

    def neq(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append(("neq", column, value))
        return self

    def gte(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append(("gte", column, value))
        return self

    def lte(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append(("lte", column, value))
        return self

    def ilike(self, column: str, value: str) -> "FakeQuery":
        self.filters.append(("ilike", column, value.strip("%").lower()))
        return self

    def contains(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append(("contains", column, value))
        return self

    def order(self, column: str, desc: bool = False) -> "FakeQuery":
        self.ordering = (column, desc)
        return self

    def limit(self, value: int) -> "FakeQuery":
        self.row_limit = value
        return self

    def _matches(self, row: dict[str, Any]) -> bool:
        for operator, column, expected in self.filters:
            actual = row.get(column)
            if operator == "eq" and str(actual) != str(expected):
                return False
            if operator == "neq" and str(actual) == str(expected):
                return False
            if operator == "gte" and str(actual) < str(expected):
                return False
            if operator == "lte" and str(actual) > str(expected):
                return False
            if operator == "ilike" and str(expected) not in str(actual or "").lower():
                return False
            if operator == "contains" and not set(expected).issubset(set(actual or [])):
                return False
        return True

    def _new_row(self, values: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        row = deepcopy(values)
        row.setdefault("id", str(uuid4()))
        row.setdefault("created_at", now)
        if self.table in {"profiles", "daily_logs"}:
            row.setdefault("updated_at", now)
        if self.table == "daily_logs":
            row.setdefault("sleep_irregular", False)
        if self.table == "symptoms":
            row.setdefault("is_repeated", False)
            row.setdefault("image_path", None)
        return row

    def execute(self) -> SimpleNamespace:
        rows = self.database.tables.setdefault(self.table, [])
        matched = [row for row in rows if self._matches(row)]

        if self.action == "insert":
            values = self.payload if isinstance(self.payload, list) else [self.payload]
            created = [self._new_row(value) for value in values]
            rows.extend(created)
            result = created
        elif self.action == "upsert":
            existing = next(
                (row for row in rows if str(row.get("id")) == str(self.payload.get("id"))),
                None,
            )
            if existing:
                existing.update(deepcopy(self.payload))
                result = [existing]
            else:
                created = self._new_row(self.payload)
                rows.append(created)
                result = [created]
        elif self.action == "update":
            now = datetime.now(timezone.utc).isoformat()
            for row in matched:
                row.update(deepcopy(self.payload))
                if self.table in {"profiles", "daily_logs"}:
                    row["updated_at"] = now
            result = matched
        elif self.action == "delete":
            result = deepcopy(matched)
            self.database.tables[self.table] = [row for row in rows if row not in matched]
        else:
            result = deepcopy(matched)
            if self.ordering:
                column, descending = self.ordering
                result.sort(key=lambda row: str(row.get(column, "")), reverse=descending)
            if self.row_limit is not None:
                result = result[: self.row_limit]
        return SimpleNamespace(data=result)


class FakeDatabase:
    def __init__(self, initial: dict[str, list[dict[str, Any]]] | None = None) -> None:
        self.tables = deepcopy(initial or {})
        self.storage = FakeStorage()

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self, name)


class FakeOpenAIService:
    model_name = "test-model"

    async def analyze_causes(self, _: dict[str, object]) -> CauseAnalysisResult:
        return CauseAnalysisResult(
            candidates=[
                CauseCandidate(
                    title="최근 수면 변화",
                    reason="최근 기록에서 수면 시간이 평소와 달랐습니다.",
                    evidence=["최근 기록의 수면 시간이 짧은 날이 있었습니다."],
                    confirmation_question="최근 잠이 부족했다고 느끼셨나요?",
                )
            ]
        )

    async def create_recommendation(
        self, _: dict[str, object]
    ) -> RecommendationResult:
        return RecommendationResult(
            action="오늘 취침 시간을 10분만 앞당겨 보세요.",
            reason="작은 변화부터 확인하기 위한 제안입니다.",
            duration_minutes=10,
            difficulty="easy",
            alternative="잠들기 전 화면을 5분만 먼저 꺼보세요.",
        )

    async def create_alternative(self, _: dict[str, object]) -> RecommendationResult:
        return RecommendationResult(
            action="의자에서 1분 동안 목을 천천히 움직여 보세요.",
            reason="시간 제약을 반영해 더 짧게 바꾼 제안입니다.",
            duration_minutes=1,
            difficulty="easy",
            alternative="깊게 세 번 호흡해 보세요.",
        )

    async def create_report(self, _: dict[str, object]) -> ReportSummary:
        return ReportSummary(
            overview="서버에서 계산한 이번 기간의 생활 기록 요약입니다.",
            observations=["기록된 날의 수면과 스트레스 추이를 함께 확인해보세요."],
            disclaimer="이 요약만으로 인과관계나 질병을 판단할 수 없습니다.",
        )


class FakeBucket:
    def __init__(self, files: dict[str, bytes]) -> None:
        self.files = files

    def upload(
        self, path: str, file: bytes, file_options: dict[str, str] | None = None
    ) -> SimpleNamespace:
        self.files[path] = file
        return SimpleNamespace(path=path)

    def remove(self, paths: list[str]) -> list[dict[str, str]]:
        for path in paths:
            self.files.pop(path, None)
        return [{"name": path} for path in paths]


class FakeStorage:
    def __init__(self) -> None:
        self.files: dict[str, bytes] = {}

    def from_(self, _: str) -> FakeBucket:
        return FakeBucket(self.files)


@pytest.fixture
def fake_db() -> FakeDatabase:
    return FakeDatabase()


@pytest.fixture
def authenticated_client(fake_db: FakeDatabase) -> Iterator[TestClient]:
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        id=USER_A, email="a@example.com"
    )
    app.dependency_overrides[get_database_client] = lambda: fake_db
    app.dependency_overrides[get_openai_service] = lambda: FakeOpenAIService()
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
