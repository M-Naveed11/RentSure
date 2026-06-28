from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserPlan
from app.schemas.user import UserResponse, UserUpdate, UsageResponse

router = APIRouter(prefix="/users", tags=["users"])

FREE_ANALYSES_LIMIT = 1
FREE_CHATS_LIMIT = 5
PREMIUM_ANALYSES_LIMIT = 999
PREMIUM_CHATS_LIMIT = 999


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/usage", response_model=UsageResponse)
def get_usage(current_user: User = Depends(get_current_user)):
    is_premium = current_user.plan == UserPlan.PREMIUM
    return UsageResponse(
        plan=current_user.plan,
        analyses_this_month=current_user.analyses_this_month,
        analyses_limit=PREMIUM_ANALYSES_LIMIT if is_premium else FREE_ANALYSES_LIMIT,
        chats_today=current_user.chats_today,
        chats_limit=PREMIUM_CHATS_LIMIT if is_premium else FREE_CHATS_LIMIT,
    )
