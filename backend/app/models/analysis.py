import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AnalysisStatus(str, enum.Enum):
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=True)
    property_type = Column(String, nullable=True)
    emirate = Column(String, nullable=True)
    area = Column(String, nullable=True)
    annual_rent = Column(Float, nullable=True)
    contract_start = Column(DateTime, nullable=True)
    contract_end = Column(DateTime, nullable=True)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PROCESSING, nullable=False)
    overall_score = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    red_flags = Column(JSON, default=list, nullable=True)
    yellow_flags = Column(JSON, default=list, nullable=True)
    green_flags = Column(JSON, default=list, nullable=True)
    fair_rent_min = Column(Float, nullable=True)
    fair_rent_max = Column(Float, nullable=True)
    rent_verdict = Column(String, nullable=True)
    language = Column(String, default="en", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="analyses")
    chat_messages = relationship("ChatMessage", back_populates="analysis")
