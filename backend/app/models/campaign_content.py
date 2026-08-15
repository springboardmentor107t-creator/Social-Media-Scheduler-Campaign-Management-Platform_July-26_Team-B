from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class CampaignContent(Base):
    __tablename__ = "campaign_contents"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    title = Column(String, nullable=False)
    content_type = Column(String, nullable=False, default="social_post")  # social_post, blog, email, ad_copy
    status = Column(String, nullable=False, default="draft")               # draft, approved, scheduled, published
    channel = Column(String, nullable=False, default="general")           # instagram, facebook, linkedin, twitter, email
    scheduled_time = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    campaign = relationship("Campaign", back_populates="contents")
    post = relationship("Post")
