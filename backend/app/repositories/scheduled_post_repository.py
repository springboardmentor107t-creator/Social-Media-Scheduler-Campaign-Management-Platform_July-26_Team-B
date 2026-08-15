from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import join

from app.models.scheduled_post import ScheduledPost, ScheduleStatus
from app.models.post import Post
from app.schemas.scheduled_post import ScheduledPostCreate, ScheduledPostUpdate

class ScheduledPostRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, schedule_in: ScheduledPostCreate) -> ScheduledPost:
        db_schedule = ScheduledPost(
            post_id=schedule_in.post_id,
            scheduled_time=schedule_in.scheduled_time,
            status=ScheduleStatus.PENDING
        )
        self.db.add(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def get_by_id(self, schedule_id: int) -> Optional[ScheduledPost]:
        return self.db.query(ScheduledPost).filter(ScheduledPost.id == schedule_id).first()

    def get_due_schedules(self, target_time: datetime) -> List[ScheduledPost]:
        return (
            self.db.query(ScheduledPost)
            .filter(
                ScheduledPost.status == ScheduleStatus.PENDING,
                ScheduledPost.scheduled_time <= target_time
            )
            .all()
        )

    def get_calendar_schedules(self, user_id: int, start_date: datetime, end_date: datetime) -> List[ScheduledPost]:
        return (
            self.db.query(ScheduledPost)
            .join(Post, ScheduledPost.post_id == Post.id)
            .filter(
                Post.user_id == user_id,
                ScheduledPost.scheduled_time >= start_date,
                ScheduledPost.scheduled_time <= end_date
            )
            .order_by(ScheduledPost.scheduled_time.asc())
            .all()
        )

    def get_user_schedules(self, user_id: int, status: Optional[ScheduleStatus] = None) -> List[ScheduledPost]:
        query = self.db.query(ScheduledPost).join(Post, ScheduledPost.post_id == Post.id).filter(Post.user_id == user_id)
        if status:
            query = query.filter(ScheduledPost.status == status)
        return query.order_by(ScheduledPost.scheduled_time.asc()).all()

    def update(self, schedule_id: int, schedule_in: ScheduledPostUpdate) -> Optional[ScheduledPost]:
        db_schedule = self.get_by_id(schedule_id)
        if not db_schedule:
            return None
        
        update_data = schedule_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_schedule, field, value)
        
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def update_status(self, schedule_id: int, status: ScheduleStatus) -> Optional[ScheduledPost]:
        db_schedule = self.get_by_id(schedule_id)
        if db_schedule:
            db_schedule.status = status
            self.db.commit()
            self.db.refresh(db_schedule)
        return db_schedule

    def delete(self, schedule_id: int) -> bool:
        db_schedule = self.get_by_id(schedule_id)
        if not db_schedule:
            return False
        self.db.delete(db_schedule)
        self.db.commit()
        return True
