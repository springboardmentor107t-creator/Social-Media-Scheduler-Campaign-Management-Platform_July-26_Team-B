from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.scheduled_post import ScheduleStatus
from app.schemas.scheduled_post import ScheduledPostCreate, ScheduledPostUpdate, ScheduledPostResponse
from app.services.scheduling_service import SchedulingService
from app.core.security import get_current_user

router = APIRouter(prefix="/schedules", tags=["Content Scheduling"])

@router.post("", response_model=ScheduledPostResponse, status_code=status.HTTP_201_CREATED)
def schedule_post(
    schedule_in: ScheduledPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = SchedulingService(db)
    return service.schedule_post(current_user.id, schedule_in)

@router.get("", response_model=List[ScheduledPostResponse])
def get_user_schedules(
    status_filter: Optional[ScheduleStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = SchedulingService(db)
    return service.get_user_schedules(current_user.id, status=status_filter)

@router.put("/{schedule_id}", response_model=ScheduledPostResponse)
def update_schedule(
    schedule_id: int,
    schedule_in: ScheduledPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = SchedulingService(db)
    return service.update_schedule(current_user.id, schedule_id, schedule_in)
