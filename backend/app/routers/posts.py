from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.post import PostStatus
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.services.post_service import PostService
from app.core.security import get_current_user

router = APIRouter(prefix="/posts", tags=["Post Management"])

@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    return service.create_post(current_user.id, post_in)

@router.post("/draft", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def save_draft(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    return service.save_draft(current_user.id, post_in)

@router.get("", response_model=List[PostResponse])
def list_posts(
    status: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    selected_status = status or status_filter
    status_enum = None
    if selected_status:
        try:
            status_enum = PostStatus(selected_status.lower())
        except ValueError:
            pass
    service = PostService(db)
    return service.get_user_posts(current_user.id, status=status_enum)

@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    return service.get_post(post_id, current_user.id)

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_in: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    return service.update_post(post_id, current_user.id, post_in)

@router.patch("/{post_id}", response_model=PostResponse)
def patch_post(
    post_id: int,
    post_in: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    return service.update_post(post_id, current_user.id, post_in)

@router.post("/{post_id}/retry", response_model=PostResponse)
def retry_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    post_in = PostUpdate(status=PostStatus.SCHEDULED)
    return service.update_post(post_id, current_user.id, post_in)

@router.post("/{post_id}/publish-now")
async def publish_now_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.social_publishers import SocialPublisherEngine
    service = PostService(db)
    post = service.get_post(post_id, current_user.id)
    
    dispatch_results = await SocialPublisherEngine.dispatch_post_to_channels(post, db)
    
    # Mark post as published
    post_in = PostUpdate(status=PostStatus.PUBLISHED)
    updated_post = service.update_post(post_id, current_user.id, post_in)
    
    return {
        "status": "published",
        "post_id": post_id,
        "dispatch": dispatch_results
    }

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PostService(db)
    service.delete_post(post_id, current_user.id)
    return None



