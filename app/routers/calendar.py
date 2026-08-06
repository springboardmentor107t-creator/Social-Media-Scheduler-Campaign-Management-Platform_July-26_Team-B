from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.scheduled_post import ScheduledPostResponse
from app.services.scheduling_service import SchedulingService
from app.core.security import get_current_user

router = APIRouter(prefix="/calendar", tags=["Publishing Calendar"])

@router.get("", response_model=List[ScheduledPostResponse])
def get_calendar(
    start_date: datetime = Query(..., description="Start of date range filtering"),
    end_date: datetime = Query(..., description="End of date range filtering"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = SchedulingService(db)
    return service.get_calendar_events(current_user.id, start_date, end_date)
