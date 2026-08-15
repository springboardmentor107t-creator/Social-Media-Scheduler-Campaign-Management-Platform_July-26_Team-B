from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.publishing_queue import QueueStatus

class PublishingQueueBase(BaseModel):
    platform: str
    scheduled_time: datetime
    max_retries: Optional[int] = 3

class PublishingQueueCreate(PublishingQueueBase):
    scheduled_post_id: int

class PublishingQueueResponse(PublishingQueueBase):
    id: int
    scheduled_post_id: int
    status: QueueStatus
    attempts: int
    last_error: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RetryQueueRequest(BaseModel):
    queue_id: int
