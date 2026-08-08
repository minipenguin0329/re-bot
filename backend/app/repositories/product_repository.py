from __future__ import annotations

from typing import Any

from supabase import Client

from app.repositories.base import execute_query


class ProductRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def list_active(self) -> list[dict[str, Any]]:
        return execute_query(
            self.client.table("products")
            .select("*")
            .eq("active", True)
            .order("created_at", desc=True)
        )

    def search(self, query_text: str) -> list[dict[str, Any]]:
        # PostgREST's text search is kept to product names for predictable MVP behavior.
        return execute_query(
            self.client.table("products")
            .select("*")
            .eq("active", True)
            .ilike("name", f"%{query_text}%")
            .order("created_at", desc=True)
        )

    def recommended(self, tags: list[str]) -> list[dict[str, Any]]:
        products: dict[str, dict[str, Any]] = {}
        for tag in tags:
            rows = execute_query(
                self.client.table("products")
                .select("*")
                .eq("active", True)
                .contains("tags", [tag])
            )
            products.update({str(row["id"]): row for row in rows})
        return list(products.values())

