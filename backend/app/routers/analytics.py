from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsRecordCreate, AnalyticsRecordResponse, AnalyticsOverview
from app.services.analytics_service import AnalyticsService
from app.core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Social Media Analytics"])

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def store_analytics(
    analytics_in: AnalyticsCreate,
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService()
    return await service.record_analytics(analytics_in)

@router.get("/post/{post_id}", response_model=List[Dict[str, Any]])
async def get_analytics_by_post(
    post_id: int,
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService()
    return await service.get_analytics_for_post(post_id)

@router.get("/summary", response_model=Dict[str, Any])
async def get_analytics_summary(
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService()
    return await service.get_analytics_summary()

@router.post("/record", response_model=AnalyticsRecordResponse, status_code=status.HTTP_201_CREATED)
def record_db_analytics(
    record_in: AnalyticsRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AnalyticsService(db)
    return service.record_db_analytics(current_user.id, record_in)

@router.get("/campaign/{campaign_id}", response_model=List[AnalyticsRecordResponse])
def get_campaign_analytics(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AnalyticsService(db)
    return service.get_campaign_analytics(current_user.id, campaign_id)

@router.get("/overview", response_model=AnalyticsOverview)
def get_user_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AnalyticsService(db)
    return service.get_user_overview(current_user.id)
