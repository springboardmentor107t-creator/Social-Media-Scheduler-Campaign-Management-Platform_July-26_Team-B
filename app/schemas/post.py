from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.models.post import PostStatus, RecurrencePattern

class PostBase(BaseModel):
    content: str
    media_urls: Optional[List[str]] = []
    platforms: Optional[List[str]] = ["instagram", "facebook", "linkedin", "twitter"]
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[RecurrencePattern] = None
    recurrence_end_date: Optional[datetime] = None

class PostCreate(PostBase):
    status: Optional[PostStatus] = PostStatus.DRAFT

class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    status: Optional[PostStatus] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[RecurrencePattern] = None
    recurrence_end_date: Optional[datetime] = None

class PostResponse(PostBase):
    id: int
    user_id: int
    status: PostStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
