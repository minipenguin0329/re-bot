from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import AuthenticatedUser, DatabaseClient
from app.schemas.chat import ChatHistoryResponse, ChatMessageCreate, ChatReplyResponse
from app.services.chat_service import ChatService
from app.services.openai_service import OpenAIService, get_openai_service

router = APIRouter(prefix="/analysis/{analysis_id}/chat", tags=["analysis chat"])
OpenAIServiceDependency = Annotated[OpenAIService, Depends(get_openai_service)]


@router.get("", response_model=ChatHistoryResponse)
async def list_chat_messages(
    analysis_id: UUID,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
    limit: int = Query(default=100, ge=1, le=100),
) -> ChatHistoryResponse:
    return ChatService(client, openai_service).list_messages(user.id, analysis_id, limit)


@router.post("", response_model=ChatReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_reply(
    analysis_id: UUID,
    payload: ChatMessageCreate,
    user: AuthenticatedUser,
    client: DatabaseClient,
    openai_service: OpenAIServiceDependency,
) -> ChatReplyResponse:
    return await ChatService(client, openai_service).reply(
        user.id, analysis_id, payload.content
    )
