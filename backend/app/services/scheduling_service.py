from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.scheduled_post_repository import ScheduledPostRepository
from app.repositories.post_repository import PostRepository
from app.models.scheduled_post import ScheduledPost, ScheduleStatus
from app.models.post import PostStatus, RecurrencePattern
from app.schemas.scheduled_post import ScheduledPostCreate, ScheduledPostUpdate

class SchedulingService:
    def __init__(self, db: Session):
        self.schedule_repo = ScheduledPostRepository(db)
        self.post_repo = PostRepository(db)

    def schedule_post(self, user_id: int, schedule_in: ScheduledPostCreate) -> ScheduledPost:
        post = self.post_repo.get_by_id(schedule_in.post_id)
        if not post or post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        # Update post status to SCHEDULED
        self.post_repo.update_status(post.id, PostStatus.SCHEDULED)
        
        # Create schedule entry
        return self.schedule_repo.create(schedule_in)

    def update_schedule(self, user_id: int, schedule_id: int, schedule_in: ScheduledPostUpdate) -> ScheduledPost:
        schedule = self.schedule_repo.get_by_id(schedule_id)
        if not schedule or schedule.post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        
        updated = self.schedule_repo.update(schedule_id, schedule_in)
        if not updated:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update schedule")
        return updated

    def get_user_schedules(self, user_id: int, status: Optional[ScheduleStatus] = None) -> List[ScheduledPost]:
        return self.schedule_repo.get_user_schedules(user_id, status=status)

    def get_calendar_events(self, user_id: int, start_date: datetime, end_date: datetime) -> List[ScheduledPost]:
        return self.schedule_repo.get_calendar_schedules(user_id, start_date, end_date)

    def calculate_next_recurrence(self, scheduled_time: datetime, pattern: RecurrencePattern) -> datetime:
        if pattern == RecurrencePattern.DAILY:
            return scheduled_time + timedelta(days=1)
        elif pattern == RecurrencePattern.WEEKLY:
            return scheduled_time + timedelta(weeks=1)
        elif pattern == RecurrencePattern.MONTHLY:
            # Approximate 30 days for monthly interval
            return scheduled_time + timedelta(days=30)
        return scheduled_time
