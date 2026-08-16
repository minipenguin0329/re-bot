import json
from functools import lru_cache
from typing import TypeVar

import openai
from openai import AsyncOpenAI
from pydantic import BaseModel, ValidationError

from app.core.config import Settings, get_settings
from app.core.exceptions import AppError
from app.prompts.chat import CHAT_INSTRUCTIONS
from app.prompts.cause_analysis import CAUSE_ANALYSIS_INSTRUCTIONS
from app.prompts.recommendation import (
    ALTERNATIVE_INSTRUCTIONS,
    RECOMMENDATION_INSTRUCTIONS,
)
from app.schemas.analysis import CauseAnalysisResult
from app.schemas.chat import ChatAnswer
from app.schemas.recommendation import RecommendationResult

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class OpenAIService:
    def __init__(
        self,
        settings: Settings,
        client: AsyncOpenAI | None = None,
    ) -> None:
        self.settings = settings
        self._client = client

    @property
    def model_name(self) -> str:
        return self.settings.openai_model

    @property
    def client(self) -> AsyncOpenAI:
        if not self.settings.openai_api_key or not self.settings.openai_model:
            raise AppError(
                "AI_ANALYSIS_FAILED",
                "OpenAI 서버 환경변수가 설정되지 않았습니다.",
                503,
            )
        if self._client is None:
            self._client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        return self._client

    async def _parse(
        self,
        instructions: str,
        context: dict[str, object],
        response_schema: type[SchemaT],
    ) -> SchemaT:
        try:
            response = await self.client.responses.parse(
                model=self.settings.openai_model,
                instructions=instructions,
                input=json.dumps(context, ensure_ascii=False, default=str),
                text_format=response_schema,
                store=False,
            )
            parsed = response.output_parsed
            if parsed is None:
                raise ValueError("OpenAI response did not include parsed output")
            return response_schema.model_validate(parsed)
        except ValidationError as exc:
            raise AppError(
                "AI_INVALID_RESPONSE",
                "AI 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.",
                502,
            ) from exc
        except (openai.APIError, openai.APITimeoutError) as exc:
            raise AppError(
                "AI_ANALYSIS_FAILED",
                "분석을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
                502,
            ) from exc
        except AppError:
            raise
        except Exception as exc:
            raise AppError(
                "AI_INVALID_RESPONSE",
                "AI 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.",
                502,
            ) from exc

    async def analyze_causes(self, context: dict[str, object]) -> CauseAnalysisResult:
        return await self._parse(
            CAUSE_ANALYSIS_INSTRUCTIONS, context, CauseAnalysisResult
        )

    async def create_recommendation(
        self, context: dict[str, object]
    ) -> RecommendationResult:
        return await self._parse(
            RECOMMENDATION_INSTRUCTIONS, context, RecommendationResult
        )

    async def create_alternative(
        self, context: dict[str, object]
    ) -> RecommendationResult:
        return await self._parse(
            ALTERNATIVE_INSTRUCTIONS, context, RecommendationResult
        )

    async def create_chat_reply(self, context: dict[str, object]) -> ChatAnswer:
        return await self._parse(CHAT_INSTRUCTIONS, context, ChatAnswer)

    async def check_connection(self) -> bool:
        class ConnectionCheck(BaseModel):
            status: str

        result = await self._parse(
            "Return the exact status value 'ok'.", {}, ConnectionCheck
        )
        return result.status == "ok"


@lru_cache
def get_openai_service() -> OpenAIService:
    return OpenAIService(get_settings())
