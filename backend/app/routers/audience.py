from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.audience import (
    AudienceSegmentCreate,
    AudienceSegmentUpdate,
    AudienceSegmentResponse,
    AudienceOverviewResponse
)
from app.services.audience_service import AudienceService
from app.core.security import get_current_user

router = APIRouter(prefix="/audience", tags=["Audience Management"])

@router.post("/segments", response_model=AudienceSegmentResponse, status_code=status.HTTP_201_CREATED)
def create_segment(
    segment_in: AudienceSegmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    return service.create_segment(current_user.id, segment_in)

@router.get("/segments", response_model=List[AudienceSegmentResponse])
def list_segments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    return service.get_user_segments(current_user.id)

@router.get("/segments/{segment_id}", response_model=AudienceSegmentResponse)
def get_segment(
    segment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    return service.get_segment(segment_id, current_user.id)

@router.put("/segments/{segment_id}", response_model=AudienceSegmentResponse)
def update_segment(
    segment_id: int,
    segment_in: AudienceSegmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    return service.update_segment(segment_id, current_user.id, segment_in)

@router.delete("/segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_segment(
    segment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    service.delete_segment(segment_id, current_user.id)
    return None

@router.get("/overview", response_model=AudienceOverviewResponse)
def get_audience_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AudienceService(db)
    return service.get_overview(current_user.id)
