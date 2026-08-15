from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.database import Base

class AudienceSegment(Base):
    __tablename__ = "audience_segments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    demographics = Column(JSON, default=dict)  # e.g., {"age_range": "25-34", "locations": ["US", "UK"]}
    interests = Column(JSON, default=list)      # e.g., ["technology", "digital marketing"]
    platform = Column(String, nullable=True, default="all")  # instagram, linkedin, facebook, twitter, all
    estimated_size = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audience_segments")
