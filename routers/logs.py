from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends

from app.models.user import User
from app.services.publishing_log_service import PublishingLogService
from app.core.security import get_current_user

router = APIRouter(prefix="/publishing-logs", tags=["Publishing Logs"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_logs(
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    service = PublishingLogService()
    return await service.get_all_logs(limit=limit)

@router.get("/post/{post_id}", response_model=List[Dict[str, Any]])
async def get_logs_for_post(
    post_id: int,
    current_user: User = Depends(get_current_user)
):
    service = PublishingLogService()
    return await service.get_logs_for_post(post_id)
