from typing import Any

from app.core.exceptions import AppError


def execute_query(query: Any) -> list[dict[str, Any]]:
    try:
        response = query.execute()
    except AppError:
        raise
    except Exception as exc:
        raise AppError(
            "DATABASE_ERROR", "데이터베이스 요청을 처리하지 못했습니다.", 503
        ) from exc
    data = getattr(response, "data", None)
    return list(data or [])


def first_or_none(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    return rows[0] if rows else None

