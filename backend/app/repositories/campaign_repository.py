from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_content import CampaignContent
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignContentCreate, CampaignContentUpdate

class CampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, campaign_in: CampaignCreate) -> Campaign:
        db_campaign = Campaign(
            user_id=user_id,
            name=campaign_in.name,
            description=campaign_in.description,
            status=campaign_in.status if campaign_in.status is not None else CampaignStatus.DRAFT,
            target_audience=campaign_in.target_audience,
            budget=campaign_in.budget,
            start_date=campaign_in.start_date,
            end_date=campaign_in.end_date
        )
        self.db.add(db_campaign)
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign

    def get_by_id(self, campaign_id: int) -> Optional[Campaign]:
        return self.db.query(Campaign).filter(Campaign.id == campaign_id).first()

    def get_user_campaigns(self, user_id: int, status: Optional[CampaignStatus] = None, skip: int = 0, limit: int = 100) -> List[Campaign]:
        query = self.db.query(Campaign).filter(Campaign.user_id == user_id)
        if status:
            query = query.filter(Campaign.status == status)
        return query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, campaign_id: int, campaign_in: CampaignUpdate) -> Optional[Campaign]:
        db_campaign = self.get_by_id(campaign_id)
        if not db_campaign:
            return None
        update_data = campaign_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_campaign, field, value)
        self.db.commit()
        self.db.refresh(db_campaign)
        return db_campaign

    def delete(self, campaign_id: int) -> bool:
        db_campaign = self.get_by_id(campaign_id)
        if not db_campaign:
            return False
        self.db.delete(db_campaign)
        self.db.commit()
        return True

    def add_content(self, campaign_id: int, content_in: CampaignContentCreate) -> CampaignContent:
        db_content = CampaignContent(
            campaign_id=campaign_id,
            post_id=content_in.post_id,
            title=content_in.title,
            content_type=content_in.content_type,
            status=content_in.status,
            channel=content_in.channel,
            scheduled_time=content_in.scheduled_time
        )
        self.db.add(db_content)
        self.db.commit()
        self.db.refresh(db_content)
        return db_content

    def get_content_by_id(self, content_id: int) -> Optional[CampaignContent]:
        return self.db.query(CampaignContent).filter(CampaignContent.id == content_id).first()

    def get_campaign_contents(self, campaign_id: int) -> List[CampaignContent]:
        return self.db.query(CampaignContent).filter(CampaignContent.campaign_id == campaign_id).all()

    def delete_content(self, content_id: int) -> bool:
        db_content = self.get_content_by_id(content_id)
        if not db_content:
            return False
        self.db.delete(db_content)
        self.db.commit()
        return True
