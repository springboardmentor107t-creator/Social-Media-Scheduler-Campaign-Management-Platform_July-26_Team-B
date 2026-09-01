from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_content import CampaignContent
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignContentCreate, CampaignContentUpdate

class CampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def compute_timeline_status(status: CampaignStatus, start_date: Optional[datetime], end_date: Optional[datetime]) -> CampaignStatus:
        # If user explicitly paused or archived the campaign, preserve that explicit action
        if status in [CampaignStatus.PAUSED, CampaignStatus.ARCHIVED]:
            return status

        now = datetime.now(timezone.utc)

        if start_date and end_date:
            start = start_date if start_date.tzinfo else start_date.replace(tzinfo=timezone.utc)
            end = end_date if end_date.tzinfo else end_date.replace(tzinfo=timezone.utc)
            # If time was set to 00:00:00, extend end date to end of the day (23:59:59)
            if end.hour == 0 and end.minute == 0 and end.second == 0:
                end = end.replace(hour=23, minute=59, second=59)

            if now > end:
                return CampaignStatus.COMPLETED
            elif now >= start:
                return CampaignStatus.ACTIVE
            else:
                return CampaignStatus.UPCOMING

        elif start_date:
            start = start_date if start_date.tzinfo else start_date.replace(tzinfo=timezone.utc)
            if now >= start:
                return CampaignStatus.ACTIVE
            else:
                return CampaignStatus.UPCOMING

        elif end_date:
            end = end_date if end_date.tzinfo else end_date.replace(tzinfo=timezone.utc)
            if end.hour == 0 and end.minute == 0 and end.second == 0:
                end = end.replace(hour=23, minute=59, second=59)
            if now > end:
                return CampaignStatus.COMPLETED
            else:
                return CampaignStatus.ACTIVE

        return status or CampaignStatus.DRAFT

    def create(self, user_id: int, campaign_in: CampaignCreate) -> Campaign:
        initial_status = campaign_in.status if campaign_in.status is not None else CampaignStatus.DRAFT
        computed_status = self.compute_timeline_status(initial_status, campaign_in.start_date, campaign_in.end_date)

        db_campaign = Campaign(
            user_id=user_id,
            name=campaign_in.name,
            description=campaign_in.description,
            status=computed_status,
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
        camp = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if camp:
            new_status = self.compute_timeline_status(camp.status, camp.start_date, camp.end_date)
            if new_status != camp.status:
                camp.status = new_status
                self.db.commit()
                self.db.refresh(camp)
        return camp

    def get_user_campaigns(self, user_id: int, status: Optional[CampaignStatus] = None, skip: int = 0, limit: int = 100) -> List[Campaign]:
        campaigns = self.db.query(Campaign).filter(Campaign.user_id == user_id).order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

        updated_any = False
        for camp in campaigns:
            new_status = self.compute_timeline_status(camp.status, camp.start_date, camp.end_date)
            if new_status != camp.status:
                camp.status = new_status
                updated_any = True

        if updated_any:
            self.db.commit()

        if status:
            campaigns = [c for c in campaigns if c.status == status]

        return campaigns

    def update(self, campaign_id: int, campaign_in: CampaignUpdate) -> Optional[Campaign]:
        db_campaign = self.get_by_id(campaign_id)
        if not db_campaign:
            return None
        update_data = campaign_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_campaign, field, value)

        # Re-compute status if dates changed and not explicitly set to paused/archived
        new_status = self.compute_timeline_status(db_campaign.status, db_campaign.start_date, db_campaign.end_date)
        db_campaign.status = new_status

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
