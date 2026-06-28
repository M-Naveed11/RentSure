from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, date, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserPlan
from app.models.chat_message import ChatMessage, MessageRole
from app.models.analysis import Analysis
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.ai_service import chat_with_assistant

router = APIRouter(prefix="/chat", tags=["chat"])


def _check_chat_limit(user: User, db: Session):
    if user.plan == UserPlan.PREMIUM:
        return

    today = date.today()
    last_reset = user.last_reset_date.date() if user.last_reset_date else None
    if last_reset != today:
        user.chats_today = 0
        user.last_reset_date = datetime.now(timezone.utc)
        db.commit()

    if user.chats_today >= 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Daily chat limit reached. Upgrade to Premium for unlimited chats.",
        )


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_chat_limit(current_user, db)

    analysis_context = None
    if payload.analysis_id:
        analysis = db.query(Analysis).filter(
            Analysis.id == payload.analysis_id,
            Analysis.user_id == current_user.id,
        ).first()
        if analysis:
            analysis_context = analysis.summary

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    history_reversed = list(reversed(history))

    user_msg = ChatMessage(
        user_id=current_user.id,
        role=MessageRole.USER,
        content=payload.content,
        language=payload.language,
        analysis_id=payload.analysis_id,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    reply_text = await chat_with_assistant(
        message=payload.content,
        language=payload.language,
        history=history_reversed,
        analysis_context=analysis_context,
    )

    assistant_msg = ChatMessage(
        user_id=current_user.id,
        role=MessageRole.ASSISTANT,
        content=reply_text,
        language=payload.language,
        analysis_id=payload.analysis_id,
    )
    db.add(assistant_msg)
    current_user.chats_today += 1
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg


@router.get("/history", response_model=List[ChatMessageResponse])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
