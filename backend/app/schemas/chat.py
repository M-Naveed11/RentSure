from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.chat_message import MessageRole


class ChatMessageRequest(BaseModel):
    content: str
    language: str = "en"
    analysis_id: Optional[UUID] = None


class ChatMessageResponse(BaseModel):
    id: UUID
    role: MessageRole
    content: str
    language: str
    analysis_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
