from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import logging

from app.repositories.publishing_queue_repository import PublishingQueueRepository
from app.repositories.scheduled_post_repository import ScheduledPostRepository
from app.models.publishing_queue import PublishingQueue, QueueStatus
from app.schemas.publishing_queue import PublishingQueueCreate
from app.services.social_media.publisher_factory import PublisherFactory
from app.services.publishing_log_service import PublishingLogService
from app.schemas.publishing_log import PublishingLogCreate

logger = logging.getLogger(__name__)

class QueueService:
    def __init__(self, db: Session):
        self.db = db
        self.queue_repo = PublishingQueueRepository(db)
        self.schedule_repo = ScheduledPostRepository(db)
        self.log_service = PublishingLogService()

    def enqueue_post(self, scheduled_post_id: int) -> List[PublishingQueue]:
        schedule = self.schedule_repo.get_by_id(scheduled_post_id)
        if not schedule or not schedule.post:
            return []

        platforms = schedule.post.platforms or ["instagram", "facebook", "linkedin", "twitter"]
        enqueued_items = []

        for platform in platforms:
            queue_in = PublishingQueueCreate(
                scheduled_post_id=scheduled_post_id,
                platform=platform,
                scheduled_time=schedule.scheduled_time
            )
            item = self.queue_repo.enqueue(queue_in)
            enqueued_items.append(item)

        return enqueued_items

    def get_queue_status(self, status: Optional[QueueStatus] = None) -> List[PublishingQueue]:
        return self.queue_repo.get_queue_by_status(status=status)

    async def process_queue_item(self, queue_id: int) -> Dict[str, Any]:
        item = self.queue_repo.mark_processing(queue_id)
        if not item:
            return {"success": False, "error": "Queue item not found"}

        schedule = item.scheduled_post
        post = schedule.post if schedule else None

        if not post:
            error_msg = f"Post missing for queue item #{queue_id}"
            self.queue_repo.mark_failed(queue_id, error_msg)
            await self.log_service.create_log(PublishingLogCreate(
                post_id=0,
                scheduled_post_id=item.scheduled_post_id,
                queue_id=queue_id,
                platform=item.platform,
                publish_status="failed",
                error_message=error_msg
            ))
            return {"success": False, "error": error_msg}

        try:
            publisher = PublisherFactory.get_publisher(item.platform)
            result = await publisher.publish_post(
                post_id=post.id,
                content=post.content,
                media_urls=post.media_urls
            )

            # Mark completed
            self.queue_repo.mark_completed(queue_id)

            # Write MongoDB log
            await self.log_service.create_log(PublishingLogCreate(
                post_id=post.id,
                scheduled_post_id=schedule.id,
                queue_id=queue_id,
                platform=item.platform,
                publish_status="published",
                details=result
            ))

            return {"success": True, "result": result}

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to publish item #{queue_id} on {item.platform}: {error_msg}")
            
            # Record failed attempt or waiting for retry
            updated_item = self.queue_repo.mark_failed(queue_id, error_msg)
            
            final_status = updated_item.status.value if updated_item else "failed"

            await self.log_service.create_log(PublishingLogCreate(
                post_id=post.id,
                scheduled_post_id=schedule.id,
                queue_id=queue_id,
                platform=item.platform,
                publish_status=final_status,
                error_message=error_msg
            ))

            return {"success": False, "error": error_msg, "status": final_status}

    async def retry_queue_item(self, queue_id: int) -> Dict[str, Any]:
        item = self.queue_repo.reset_for_retry(queue_id)
        if not item:
            return {"success": False, "error": "Queue item not found"}

        return await self.process_queue_item(queue_id)
