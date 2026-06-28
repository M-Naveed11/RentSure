from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class DocumentGenerateRequest(BaseModel):
    type: str
    language: str = "en"
    input_data: Dict[str, Any]


class DocumentResponse(BaseModel):
    id: UUID
    type: str
    title: str
    content: str
    file_url: Optional[str]
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


DOCUMENT_TYPES = [
    "rent_reduction",
    "deposit_refund",
    "maintenance_complaint",
    "notice_to_vacate",
    "counter_eviction",
    "rdsc_complaint",
]
