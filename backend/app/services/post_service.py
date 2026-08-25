from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.post_repository import PostRepository
from app.repositories.scheduled_post_repository import ScheduledPostRepository
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.schemas.scheduled_post import ScheduledPostCreate
from app.models.post import PostStatus, Post
from app.models.scheduled_post import ScheduledPost, ScheduleStatus

class PostService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = PostRepository(db)
        self.schedule_repo = ScheduledPostRepository(db)

    def _attach_scheduled_at(self, post: Post) -> Post:
        if not post:
            return post
        sched = self.db.query(ScheduledPost).filter(ScheduledPost.post_id == post.id).order_by(ScheduledPost.scheduled_time.asc()).first()
        if sched:
            setattr(post, "scheduled_at", sched.scheduled_time)
        return post

    def create_post(self, user_id: int, post_in: PostCreate) -> Post:
        post = self.repository.create(user_id, post_in)
        
        # If scheduled date is provided or post is marked scheduled, create schedule record
        if post_in.scheduled_at or post.status == PostStatus.SCHEDULED:
            sched_time = post_in.scheduled_at or datetime.now(timezone.utc)
            self.schedule_repo.create(
                ScheduledPostCreate(
                    post_id=post.id,
                    scheduled_time=sched_time,
                    status=ScheduleStatus.PENDING
                )
            )
            setattr(post, "scheduled_at", sched_time)
            
        return post

    def save_draft(self, user_id: int, post_in: PostCreate) -> Post:
        post_in.status = PostStatus.DRAFT
        return self.repository.create(user_id, post_in)

    def get_post(self, post_id: int, user_id: int) -> Post:
        post = self.repository.get_by_id(post_id)
        if not post or post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return self._attach_scheduled_at(post)

    def get_user_posts(self, user_id: int, status: Optional[PostStatus] = None) -> List[Post]:
        posts = self.repository.get_user_posts(user_id, status=status)
        for p in posts:
            self._attach_scheduled_at(p)
        return posts

    def update_post(self, post_id: int, user_id: int, post_in: PostUpdate) -> Post:
        # Validate existence & ownership
        post = self.get_post(post_id, user_id)
        updated_post = self.repository.update(post_id, post_in)
        if not updated_post:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not update post")

        if post_in.scheduled_at:
            sched = self.db.query(ScheduledPost).filter(ScheduledPost.post_id == post_id).first()
            if sched:
                sched.scheduled_time = post_in.scheduled_at
                self.db.commit()
            else:
                self.schedule_repo.create(
                    ScheduledPostCreate(
                        post_id=post_id,
                        scheduled_time=post_in.scheduled_at,
                        status=ScheduleStatus.PENDING
                    )
                )
            setattr(updated_post, "scheduled_at", post_in.scheduled_at)

        return self._attach_scheduled_at(updated_post)

    def delete_post(self, post_id: int, user_id: int) -> bool:
        self.get_post(post_id, user_id)
        return self.repository.delete(post_id)
