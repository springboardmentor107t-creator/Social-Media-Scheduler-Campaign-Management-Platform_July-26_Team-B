from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from app.models.scheduled_post import ScheduleStatus
from app.schemas.post import PostResponse

class ScheduledPostBase(BaseModel):
    scheduled_time: datetime

class ScheduledPostCreate(ScheduledPostBase):
    post_id: int

class ScheduledPostUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    status: Optional[ScheduleStatus] = None

class ScheduledPostResponse(ScheduledPostBase):
    id: int
    post_id: int
    status: ScheduleStatus
    created_at: datetime
    updated_at: datetime
    post: Optional[PostResponse] = None

    model_config = ConfigDict(from_attributes=True)

class CalendarFilterQuery(BaseModel):
    start_date: datetime
    end_date: datetime
