from typing import List, Dict, Any
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import AnalyticsCreate

class AnalyticsService:
    def __init__(self):
        self.repository = AnalyticsRepository()

    async def record_analytics(self, analytics_in: AnalyticsCreate) -> Dict[str, Any]:
        return await self.repository.upsert_analytics(analytics_in)

    async def get_analytics_for_post(self, post_id: int) -> List[Dict[str, Any]]:
        return await self.repository.get_by_post(post_id)

    async def get_analytics_summary(self) -> Dict[str, Any]:
        return await self.repository.get_summary()
