from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from app.models.analysis import AnalysisStatus


class FlagItem(BaseModel):
    clause: str
    issue: str
    law_reference: Optional[str] = None
    recommendation: str


class AnalysisResponse(BaseModel):
    id: UUID
    file_name: str
    file_url: Optional[str]
    property_type: Optional[str]
    emirate: Optional[str]
    area: Optional[str]
    annual_rent: Optional[float]
    contract_start: Optional[datetime]
    contract_end: Optional[datetime]
    status: AnalysisStatus
    overall_score: Optional[int]
    summary: Optional[str]
    red_flags: Optional[List[Any]]
    yellow_flags: Optional[List[Any]]
    green_flags: Optional[List[Any]]
    fair_rent_min: Optional[float]
    fair_rent_max: Optional[float]
    rent_verdict: Optional[str]
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    id: UUID
    file_name: str
    status: AnalysisStatus
    overall_score: Optional[int]
    emirate: Optional[str]
    annual_rent: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
