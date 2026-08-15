from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base

class QueueStatus(str, enum.Enum):
    WAITING = "waiting"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PublishingQueue(Base):
    __tablename__ = "publishing_queue"

    id = Column(Integer, primary_key=True, index=True)
    scheduled_post_id = Column(Integer, ForeignKey("scheduled_posts.id"), nullable=False)
    platform = Column(String, nullable=False)  # instagram, facebook, linkedin, twitter
    status = Column(Enum(QueueStatus), default=QueueStatus.WAITING, nullable=False)
    attempts = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    last_error = Column(Text, nullable=True)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    processed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    scheduled_post = relationship("ScheduledPost", back_populates="queue_items")
