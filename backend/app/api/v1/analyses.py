from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserPlan
from app.models.analysis import Analysis, AnalysisStatus
from app.schemas.analysis import AnalysisResponse, AnalysisListItem
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_lease
from app.services.email_service import send_analysis_complete_email
import cloudinary
import cloudinary.uploader
from app.core.config import settings

router = APIRouter(prefix="/analyses", tags=["analyses"])

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def _check_analysis_limit(user: User):
    if user.plan == UserPlan.FREE and user.analyses_this_month >= 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Free plan limit reached. Upgrade to Premium for unlimited analyses.",
        )


@router.post("/upload", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_analysis(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_analysis_limit(current_user)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    contents = await file.read()

    upload_result = cloudinary.uploader.upload(
        contents,
        resource_type="raw",
        folder="rentsure/leases",
        public_id=f"{current_user.id}/{file.filename}",
    )
    file_url = upload_result["secure_url"]

    extracted_text = extract_text_from_pdf(contents)

    analysis = Analysis(
        user_id=current_user.id,
        file_name=file.filename,
        file_url=file_url,
        extracted_text=extracted_text,
        status=AnalysisStatus.PROCESSING,
        language=current_user.preferred_language,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.post("/analyze/{analysis_id}", response_model=AnalysisResponse)
async def run_analysis(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    if not analysis.extracted_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No text extracted from file")

    try:
        result = await analyze_lease(analysis.extracted_text, analysis.language)

        analysis.overall_score = result.get("overallScore")
        analysis.summary = result.get("summary")
        analysis.red_flags = result.get("redFlags", [])
        analysis.yellow_flags = result.get("yellowFlags", [])
        analysis.green_flags = result.get("greenFlags", [])
        analysis.property_type = result.get("propertyType")
        analysis.emirate = result.get("emirate")
        analysis.area = result.get("area")
        analysis.annual_rent = result.get("annualRent")
        analysis.fair_rent_min = result.get("fairRentMin")
        analysis.fair_rent_max = result.get("fairRentMax")
        analysis.rent_verdict = result.get("rentVerdict")
        analysis.status = AnalysisStatus.COMPLETED

        current_user.analyses_this_month += 1
        db.commit()
        db.refresh(analysis)
        try:
            send_analysis_complete_email(
                current_user.email, current_user.name,
                str(analysis.id), analysis.overall_score or 0
            )
        except Exception:
            pass
    except Exception as e:
        analysis.status = AnalysisStatus.FAILED
        db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return analysis


@router.get("", response_model=List[AnalysisListItem])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
