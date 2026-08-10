from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import AnalyticsCreate, AnalyticsRecordCreate, AnalyticsOverview

class AnalyticsService:
    def __init__(self, db: Optional[Session] = None):
        self.repository = AnalyticsRepository(db)

    async def record_analytics(self, analytics_in: AnalyticsCreate) -> Dict[str, Any]:
        return await self.repository.upsert_analytics(analytics_in)

    async def get_analytics_for_post(self, post_id: int) -> List[Dict[str, Any]]:
        return await self.repository.get_by_post(post_id)

    async def get_analytics_summary(self) -> Dict[str, Any]:
        return await self.repository.get_summary()

    def record_db_analytics(self, user_id: int, record_in: AnalyticsRecordCreate):
        return self.repository.create_record(user_id, record_in)

    def get_campaign_analytics(self, user_id: int, campaign_id: int):
        return self.repository.get_campaign_analytics(user_id, campaign_id)

    def get_user_overview(self, user_id: int) -> AnalyticsOverview:
        records = self.repository.get_user_analytics_records(user_id)
        if not records:
            return AnalyticsOverview()

        total_impressions = sum(r.impressions for r in records)
        total_reach = sum(r.reach for r in records)
        total_likes = sum(r.likes for r in records)
        total_comments = sum(r.comments for r in records)
        total_shares = sum(r.shares for r in records)
        total_clicks = sum(r.clicks for r in records)
        avg_eng_rate = (
            sum(r.engagement_rate for r in records) / len(records) if records else 0.0
        )

        platform_breakdown = {}
        for r in records:
            p = r.platform.lower()
            if p not in platform_breakdown:
                platform_breakdown[p] = {
                    "impressions": 0,
                    "reach": 0,
                    "likes": 0,
                    "comments": 0,
                    "shares": 0,
                    "clicks": 0,
                    "count": 0
                }
            platform_breakdown[p]["impressions"] += r.impressions
            platform_breakdown[p]["reach"] += r.reach
            platform_breakdown[p]["likes"] += r.likes
            platform_breakdown[p]["comments"] += r.comments
            platform_breakdown[p]["shares"] += r.shares
            platform_breakdown[p]["clicks"] += r.clicks
            platform_breakdown[p]["count"] += 1

        return AnalyticsOverview(
            total_impressions=total_impressions,
            total_reach=total_reach,
            total_likes=total_likes,
            total_comments=total_comments,
            total_shares=total_shares,
            total_clicks=total_clicks,
            avg_engagement_rate=round(avg_eng_rate, 2),
            platform_breakdown=platform_breakdown
        )
