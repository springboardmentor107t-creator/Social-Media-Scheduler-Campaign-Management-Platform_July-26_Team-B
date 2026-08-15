from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.publishing_queue import QueueStatus
from app.schemas.publishing_queue import PublishingQueueResponse, RetryQueueRequest
from app.services.queue_service import QueueService
from app.core.security import get_current_user

router = APIRouter(prefix="/queue", tags=["Publishing Queue Management"])

@router.get("", response_model=List[PublishingQueueResponse])
def list_queue_items(
    status_filter: Optional[QueueStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = QueueService(db)
    return service.get_queue_status(status=status_filter)

@router.post("/retry/{queue_id}")
async def retry_failed_publishing(
    queue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = QueueService(db)
    return await service.retry_queue_item(queue_id)
