from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class RentBenchmarkResponse(BaseModel):
    emirate: str
    area: str
    property_type: str
    bedrooms: Optional[int]
    avg_rent: float
    min_rent: float
    max_rent: float
    source: Optional[str]

    class Config:
        from_attributes = True


class RentCompareRequest(BaseModel):
    emirate: str
    area: str
    property_type: str
    bedrooms: Optional[int] = None
    annual_rent: float


class RentCompareResponse(BaseModel):
    your_rent: float
    avg_rent: float
    min_rent: float
    max_rent: float
    verdict: str
    percentage_above_avg: float
