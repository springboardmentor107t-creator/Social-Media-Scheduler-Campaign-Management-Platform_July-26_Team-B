from typing import List, Dict, Any, Optional
from app.repositories.publishing_log_repository import PublishingLogRepository
from app.schemas.publishing_log import PublishingLogCreate

class PublishingLogService:
    def __init__(self):
        self.repository = PublishingLogRepository()

    async def create_log(self, log_in: PublishingLogCreate) -> Dict[str, Any]:
        return await self.repository.log_event(log_in)

    async def get_logs_for_post(self, post_id: int) -> List[Dict[str, Any]]:
        return await self.repository.get_logs_by_post(post_id)

    async def get_all_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        return await self.repository.get_all_logs(limit=limit)
