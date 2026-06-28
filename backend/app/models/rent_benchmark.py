import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class RentBenchmark(Base):
    __tablename__ = "rent_benchmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    emirate = Column(String, nullable=False, index=True)
    area = Column(String, nullable=False, index=True)
    property_type = Column(String, nullable=False)
    bedrooms = Column(Integer, nullable=True)
    avg_rent = Column(Float, nullable=False)
    min_rent = Column(Float, nullable=False)
    max_rent = Column(Float, nullable=False)
    source = Column(String, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
