from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChatMessageCreate(BaseModel):
    content: Annotated[str, Field(min_length=1, max_length=2000)]

    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        if not normalized:
            raise ValueError("메시지를 입력해주세요.")
        return normalized


class ChatAnswer(BaseModel):
    answer: Annotated[str, Field(min_length=1, max_length=4000)]

    model_config = ConfigDict(extra="forbid")

    @field_validator("answer")
    @classmethod
    def normalize_answer(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("AI 답변이 비어 있습니다.")
        return normalized


class ChatMessageResponse(BaseModel):
    id: UUID
    analysis_id: UUID
    turn_id: UUID
    role: Literal["user", "assistant"]
    content: str
    model_name: str | None = None
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    analysis_id: UUID
    messages: list[ChatMessageResponse]


class ChatReplyResponse(BaseModel):
    analysis_id: UUID
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse
