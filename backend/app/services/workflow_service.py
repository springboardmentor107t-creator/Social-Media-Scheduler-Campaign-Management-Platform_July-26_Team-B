from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import logging

from app.repositories.scheduled_post_repository import ScheduledPostRepository
from app.repositories.post_repository import PostRepository
from app.models.scheduled_post import ScheduleStatus, ScheduledPost
from app.models.post import PostStatus, RecurrencePattern
from app.services.queue_service import QueueService
from app.services.scheduling_service import SchedulingService
from app.schemas.scheduled_post import ScheduledPostCreate

logger = logging.getLogger(__name__)

class AutomatedWorkflowService:
    def __init__(self, db: Session):
        self.db = db
        self.schedule_repo = ScheduledPostRepository(db)
        self.post_repo = PostRepository(db)
        self.queue_service = QueueService(db)
        self.scheduling_service = SchedulingService(db)

    async def run_publishing_cycle(self) -> Dict[str, Any]:
        """
        1. Find pending scheduled posts whose scheduled_time <= now.
        2. Transition schedule status to PROCESSING.
        3. Enqueue platform items into publishing queue.
        4. Execute publishing queue items.
        5. Update post status to PUBLISHED (or FAILED if all queue items fail).
        6. Handle recurring post schedules automatically.
        """
        now = datetime.now(timezone.utc)
        due_schedules = self.schedule_repo.get_due_schedules(now)

        processed_count = 0
        failed_count = 0
        recurring_count = 0

        for schedule in due_schedules:
            self.schedule_repo.update_status(schedule.id, ScheduleStatus.PROCESSING)
            
            # Enqueue items
            queue_items = self.queue_service.enqueue_post(schedule.id)
            
            all_success = True
            for item in queue_items:
                res = await self.queue_service.process_queue_item(item.id)
                if not res.get("success"):
                    all_success = False

            if all_success and queue_items:
                self.schedule_repo.update_status(schedule.id, ScheduleStatus.COMPLETED)
                self.post_repo.update_status(schedule.post_id, PostStatus.PUBLISHED)
                processed_count += 1

                # Check Recurring Post setup
                post = schedule.post
                if post and post.is_recurring and post.recurrence_pattern:
                    next_time = self.scheduling_service.calculate_next_recurrence(
                        schedule.scheduled_time,
                        post.recurrence_pattern
                    )
                    
                    if not post.recurrence_end_date or next_time <= post.recurrence_end_date:
                        new_sched = self.schedule_repo.create(ScheduledPostCreate(
                            post_id=post.id,
                            scheduled_time=next_time
                        ))
                        # Keep post in scheduled state
                        self.post_repo.update_status(post.id, PostStatus.SCHEDULED)
                        recurring_count += 1
            else:
                self.schedule_repo.update_status(schedule.id, ScheduleStatus.FAILED)
                self.post_repo.update_status(schedule.post_id, PostStatus.FAILED)
                failed_count += 1

        return {
            "due_schedules_found": len(due_schedules),
            "successfully_published": processed_count,
            "failed_publishing": failed_count,
            "recurring_schedules_generated": recurring_count,
            "timestamp": now.isoformat()
        }

    async def publish_single_post(self, post_id: int) -> Dict[str, Any]:
        """
        Immediately dispatches and publishes a single post by ID.
        """
        # Find or create schedule record
        schedule = (
            self.db.query(ScheduledPost)
            .filter(ScheduledPost.post_id == post_id)
            .order_by(ScheduledPost.id.desc())
            .first()
        )
        if not schedule:
            schedule = self.schedule_repo.create(ScheduledPostCreate(
                post_id=post_id,
                scheduled_time=datetime.now(timezone.utc),
                status=ScheduleStatus.PENDING
            ))

        self.schedule_repo.update_status(schedule.id, ScheduleStatus.PROCESSING)
        queue_items = self.queue_service.enqueue_post(schedule.id)

        all_success = True
        results = []
        for item in queue_items:
            res = await self.queue_service.process_queue_item(item.id)
            results.append(res)
            if not res.get("success"):
                all_success = False

        if all_success:
            self.schedule_repo.update_status(schedule.id, ScheduleStatus.COMPLETED)
            self.post_repo.update_status(post_id, PostStatus.PUBLISHED)
            return {"success": True, "post_id": post_id, "status": "published", "results": results}
        else:
            self.schedule_repo.update_status(schedule.id, ScheduleStatus.FAILED)
            self.post_repo.update_status(post_id, PostStatus.FAILED)
            return {"success": False, "post_id": post_id, "status": "failed", "results": results}
