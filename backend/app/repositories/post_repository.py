from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.post import Post, PostStatus
from app.schemas.post import PostCreate, PostUpdate

class PostRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, post_in: PostCreate) -> Post:
        db_post = Post(
            user_id=user_id,
            content=post_in.content,
            media_urls=post_in.media_urls,
            platforms=post_in.platforms,
            status=post_in.status or PostStatus.DRAFT,
            is_recurring=post_in.is_recurring,
            recurrence_pattern=post_in.recurrence_pattern,
            recurrence_end_date=post_in.recurrence_end_date
        )
        self.db.add(db_post)
        self.db.commit()
        self.db.refresh(db_post)
        return db_post

    def get_by_id(self, post_id: int) -> Optional[Post]:
        return self.db.query(Post).filter(Post.id == post_id).first()

    def get_user_posts(self, user_id: int, status: Optional[PostStatus] = None, limit: int = 100, skip: int = 0) -> List[Post]:
        query = self.db.query(Post).filter(Post.user_id == user_id)
        if status:
            query = query.filter(Post.status == status)
        return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, post_id: int, post_in: PostUpdate) -> Optional[Post]:
        db_post = self.get_by_id(post_id)
        if not db_post:
            return None
        
        update_data = post_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_post, field, value)
        
        self.db.commit()
        self.db.refresh(db_post)
        return db_post

    def update_status(self, post_id: int, status: PostStatus) -> Optional[Post]:
        db_post = self.get_by_id(post_id)
        if db_post:
            db_post.status = status
            self.db.commit()
            self.db.refresh(db_post)
        return db_post

    def delete(self, post_id: int) -> bool:
        db_post = self.get_by_id(post_id)
        if not db_post:
            return False
        self.db.delete(db_post)
        self.db.commit()
        return True
