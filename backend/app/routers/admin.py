from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.post import Post, PostStatus
from app.models.scheduled_post import ScheduledPost
from app.schemas.user import UserResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Management"])

class AdminPostResponse(BaseModel):
    id: int
    content: str
    platforms: List[str]
    status: str
    owner_name: str
    owner_role: str
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

@router.get("/posts", response_model=List[AdminPostResponse])
def get_all_platform_posts(
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    
    query = db.query(Post).join(User, Post.user_id == User.id)
    
    if status:
        query = query.filter(Post.status == status)
    if role:
        query = query.filter(User.role == role)
        
    posts = query.order_by(Post.created_at.desc()).all()
    
    result = []
    for p in posts:
        first_schedule = db.query(ScheduledPost).filter(ScheduledPost.post_id == p.id).first()
        sched_time = first_schedule.scheduled_time if first_schedule else None
        
        status_str = p.status.value if hasattr(p.status, "value") else str(p.status)
        
        result.append(AdminPostResponse(
            id=p.id,
            content=p.content or "",
            platforms=p.platforms or [],
            status=status_str,
            owner_name=p.user.username if p.user else "Unknown",
            owner_role=p.user.role if p.user else "creator",
            scheduled_at=sched_time,
            published_at=p.updated_at if status_str == "published" else None,
            created_at=p.created_at
        ))
    return result

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
            full_name=u.username
        )
        for u in users
    ]
