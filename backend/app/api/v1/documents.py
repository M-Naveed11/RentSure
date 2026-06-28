from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserPlan
from app.models.generated_document import GeneratedDocument
from app.schemas.document import DocumentGenerateRequest, DocumentResponse, DOCUMENT_TYPES
from app.services.ai_service import generate_document
from app.services.pdf_service import generate_pdf

router = APIRouter(prefix="/documents", tags=["documents"])


def _check_premium(user: User):
    if user.plan != UserPlan.PREMIUM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document generation requires Premium plan.",
        )


@router.post("/generate", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_premium(current_user)

    if payload.type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown document type: {payload.type}")

    content, title = await generate_document(
        doc_type=payload.type,
        input_data=payload.input_data,
        language=payload.language,
    )

    doc = GeneratedDocument(
        user_id=current_user.id,
        type=payload.type,
        title=title,
        content=content,
        language=payload.language,
        input_data=payload.input_data,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(GeneratedDocument)
        .filter(GeneratedDocument.user_id == current_user.id)
        .order_by(GeneratedDocument.created_at.desc())
        .all()
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.get("/{document_id}/pdf")
def download_pdf(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    pdf_path = generate_pdf(doc.content, doc.title)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{doc.title}.pdf",
    )
