from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.campaign import CampaignStatus
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CampaignDetailResponse,
    CampaignContentCreate,
    CampaignContentResponse
)
from app.services.campaign_service import CampaignService
from app.core.security import get_current_user

router = APIRouter(prefix="/campaigns", tags=["Campaign Management"])

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign_in: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.create_campaign(current_user.id, campaign_in)

@router.get("", response_model=List[CampaignResponse])
def list_campaigns(
    status_filter: Optional[CampaignStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.get_user_campaigns(current_user.id, status_filter=status_filter)

@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.get_campaign(campaign_id, current_user.id)

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_in: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.update_campaign(campaign_id, current_user.id, campaign_in)

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    service.delete_campaign(campaign_id, current_user.id)
    return None

# Campaign Content Endpoints
@router.post("/{campaign_id}/content", response_model=CampaignContentResponse, status_code=status.HTTP_201_CREATED)
def add_campaign_content(
    campaign_id: int,
    content_in: CampaignContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.add_campaign_content(campaign_id, current_user.id, content_in)

@router.get("/{campaign_id}/content", response_model=List[CampaignContentResponse])
def list_campaign_contents(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    return service.get_campaign_contents(campaign_id, current_user.id)

@router.delete("/{campaign_id}/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign_content(
    campaign_id: int,
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CampaignService(db)
    service.delete_campaign_content(campaign_id, content_id, current_user.id)
    return None
