from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class PublishingLogBase(BaseModel):
    post_id: int
    scheduled_post_id: Optional[int] = None
    queue_id: Optional[int] = None
    platform: str
    publish_status: str  # e.g., "success", "failed", "retrying"
    error_message: Optional[str] = None
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PublishingLogCreate(PublishingLogBase):
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

class PublishingLogResponse(PublishingLogBase):
    id: Optional[str] = Field(default=None, alias="_id")
    timestamp: datetime

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
