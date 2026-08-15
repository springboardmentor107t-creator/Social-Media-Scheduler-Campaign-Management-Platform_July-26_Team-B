from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.campaign_repository import CampaignRepository
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignContentCreate
)
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_content import CampaignContent

class CampaignService:
    def __init__(self, db: Session):
        self.repository = CampaignRepository(db)

    def create_campaign(self, user_id: int, campaign_in: CampaignCreate) -> Campaign:
        return self.repository.create(user_id, campaign_in)

    def get_campaign(self, campaign_id: int, user_id: int) -> Campaign:
        campaign = self.repository.get_by_id(campaign_id)
        if not campaign or campaign.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        return campaign

    def get_user_campaigns(
        self, user_id: int, status_filter: Optional[CampaignStatus] = None
    ) -> List[Campaign]:
        return self.repository.get_user_campaigns(user_id, status=status_filter)

    def update_campaign(
        self, campaign_id: int, user_id: int, campaign_in: CampaignUpdate
    ) -> Campaign:
        self.get_campaign(campaign_id, user_id)
        updated = self.repository.update(campaign_id, campaign_in)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not update campaign"
            )
        return updated

    def delete_campaign(self, campaign_id: int, user_id: int) -> bool:
        self.get_campaign(campaign_id, user_id)
        return self.repository.delete(campaign_id)

    # Campaign Content operations
    def add_campaign_content(
        self, campaign_id: int, user_id: int, content_in: CampaignContentCreate
    ) -> CampaignContent:
        self.get_campaign(campaign_id, user_id)
        return self.repository.add_content(campaign_id, content_in)

    def get_campaign_contents(
        self, campaign_id: int, user_id: int
    ) -> List[CampaignContent]:
        self.get_campaign(campaign_id, user_id)
        return self.repository.get_campaign_contents(campaign_id)

    def delete_campaign_content(
        self, campaign_id: int, content_id: int, user_id: int
    ) -> bool:
        self.get_campaign(campaign_id, user_id)
        content = self.repository.get_content_by_id(content_id)
        if not content or content.campaign_id != campaign_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign content not found"
            )
        return self.repository.delete_content(content_id)
