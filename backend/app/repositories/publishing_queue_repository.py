from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.publishing_queue import PublishingQueue, QueueStatus
from app.schemas.publishing_queue import PublishingQueueCreate

class PublishingQueueRepository:
    def __init__(self, db: Session):
        self.db = db

    def enqueue(self, queue_in: PublishingQueueCreate) -> PublishingQueue:
        db_queue = PublishingQueue(
            scheduled_post_id=queue_in.scheduled_post_id,
            platform=queue_in.platform,
            scheduled_time=queue_in.scheduled_time,
            max_retries=queue_in.max_retries or 3,
            status=QueueStatus.WAITING,
            attempts=0
        )
        self.db.add(db_queue)
        self.db.commit()
        self.db.refresh(db_queue)
        return db_queue

    def get_by_id(self, queue_id: int) -> Optional[PublishingQueue]:
        return self.db.query(PublishingQueue).filter(PublishingQueue.id == queue_id).first()

    def get_pending_items(self, target_time: datetime) -> List[PublishingQueue]:
        return (
            self.db.query(PublishingQueue)
            .filter(
                PublishingQueue.status == QueueStatus.WAITING,
                PublishingQueue.scheduled_time <= target_time
            )
            .all()
        )

    def get_queue_by_status(self, status: Optional[QueueStatus] = None) -> List[PublishingQueue]:
        query = self.db.query(PublishingQueue)
        if status:
            query = query.filter(PublishingQueue.status == status)
        return query.order_by(PublishingQueue.scheduled_time.desc()).all()

    def mark_processing(self, queue_id: int) -> Optional[PublishingQueue]:
        item = self.get_by_id(queue_id)
        if item:
            item.status = QueueStatus.PROCESSING
            item.attempts += 1
            self.db.commit()
            self.db.refresh(item)
        return item

    def mark_completed(self, queue_id: int) -> Optional[PublishingQueue]:
        item = self.get_by_id(queue_id)
        if item:
            item.status = QueueStatus.COMPLETED
            item.processed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(item)
        return item

    def mark_failed(self, queue_id: int, error_message: str) -> Optional[PublishingQueue]:
        item = self.get_by_id(queue_id)
        if item:
            item.last_error = error_message
            if item.attempts >= item.max_retries:
                item.status = QueueStatus.FAILED
            else:
                # Reset to WAITING to trigger retry mechanism
                item.status = QueueStatus.WAITING
            self.db.commit()
            self.db.refresh(item)
        return item

    def reset_for_retry(self, queue_id: int) -> Optional[PublishingQueue]:
        item = self.get_by_id(queue_id)
        if item:
            item.status = QueueStatus.WAITING
            item.last_error = None
            self.db.commit()
            self.db.refresh(item)
        return item
