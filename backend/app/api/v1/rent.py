from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rent_benchmark import RentBenchmark
from app.schemas.rent import RentBenchmarkResponse, RentCompareRequest, RentCompareResponse

router = APIRouter(prefix="/rent", tags=["rent"])


@router.get("/benchmark", response_model=RentBenchmarkResponse)
def get_benchmark(
    emirate: str,
    area: str,
    property_type: str,
    bedrooms: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(RentBenchmark).filter(
        RentBenchmark.emirate.ilike(emirate),
        RentBenchmark.area.ilike(area),
        RentBenchmark.property_type.ilike(property_type),
    )
    if bedrooms is not None:
        query = query.filter(RentBenchmark.bedrooms == bedrooms)

    benchmark = query.first()
    if not benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No benchmark data found for these criteria")
    return benchmark


@router.post("/compare", response_model=RentCompareResponse)
def compare_rent(
    payload: RentCompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(RentBenchmark).filter(
        RentBenchmark.emirate.ilike(payload.emirate),
        RentBenchmark.area.ilike(payload.area),
        RentBenchmark.property_type.ilike(payload.property_type),
    )
    if payload.bedrooms is not None:
        query = query.filter(RentBenchmark.bedrooms == payload.bedrooms)

    benchmark = query.first()
    if not benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No benchmark data found")

    pct_above = ((payload.annual_rent - benchmark.avg_rent) / benchmark.avg_rent) * 100

    if payload.annual_rent <= benchmark.min_rent:
        verdict = "well_below_market"
    elif payload.annual_rent <= benchmark.avg_rent * 0.9:
        verdict = "below_market"
    elif payload.annual_rent <= benchmark.avg_rent * 1.1:
        verdict = "fair"
    elif payload.annual_rent <= benchmark.max_rent:
        verdict = "above_market"
    else:
        verdict = "overpriced"

    return RentCompareResponse(
        your_rent=payload.annual_rent,
        avg_rent=benchmark.avg_rent,
        min_rent=benchmark.min_rent,
        max_rent=benchmark.max_rent,
        verdict=verdict,
        percentage_above_avg=round(pct_above, 1),
    )
