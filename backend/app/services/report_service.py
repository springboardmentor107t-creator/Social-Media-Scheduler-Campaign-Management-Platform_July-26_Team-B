from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.campaign_repository import CampaignRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.audience_repository import AudienceRepository
from app.repositories.post_repository import PostRepository

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.campaign_repo = CampaignRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.audience_repo = AudienceRepository(db)
        self.post_repo = PostRepository(db)

    def get_campaign_report(self, user_id: int, campaign_id: int) -> Dict[str, Any]:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign or campaign.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        contents = self.campaign_repo.get_campaign_contents(campaign_id)
        analytics_records = self.analytics_repo.get_campaign_analytics(user_id, campaign_id)

        total_impressions = sum(r.impressions for r in analytics_records)
        total_reach = sum(r.reach for r in analytics_records)
        total_likes = sum(r.likes for r in analytics_records)
        total_comments = sum(r.comments for r in analytics_records)
        total_shares = sum(r.shares for r in analytics_records)
        total_clicks = sum(r.clicks for r in analytics_records)

        return {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "status": campaign.status.value if hasattr(campaign.status, "value") else str(campaign.status),
            "budget": campaign.budget,
            "target_audience": campaign.target_audience,
            "total_content_items": len(contents),
            "total_impressions": total_impressions,
            "total_reach": total_reach,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_clicks": total_clicks,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def get_overall_performance_report(self, user_id: int) -> Dict[str, Any]:
        posts = self.post_repo.get_user_posts(user_id)
        campaigns = self.campaign_repo.get_user_campaigns(user_id)
        segments = self.audience_repo.get_user_segments(user_id)
        analytics_records = self.analytics_repo.get_user_analytics_records(user_id)

        total_impressions = sum(r.impressions for r in analytics_records)
        total_reach = sum(r.reach for r in analytics_records)
        total_likes = sum(r.likes for r in analytics_records)
        total_comments = sum(r.comments for r in analytics_records)

        return {
            "user_id": user_id,
            "total_posts": len(posts),
            "total_campaigns": len(campaigns),
            "total_audience_segments": len(segments),
            "total_impressions": total_impressions,
            "total_reach": total_reach,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def export_report_data(self, user_id: int, report_type: str = "summary") -> Dict[str, Any]:
        overall = self.get_overall_performance_report(user_id)
        return {
            "report_type": report_type,
            "data": overall,
            "export_timestamp": datetime.now(timezone.utc).isoformat()
        }
