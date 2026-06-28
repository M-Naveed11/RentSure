from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserPlan


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    plan: UserPlan
    preferred_language: str
    analyses_this_month: int
    chats_today: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None


class UsageResponse(BaseModel):
    plan: UserPlan
    analyses_this_month: int
    analyses_limit: int
    chats_today: int
    chats_limit: int
