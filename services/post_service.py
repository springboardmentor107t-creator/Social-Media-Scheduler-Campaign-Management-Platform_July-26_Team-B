from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.post_repository import PostRepository
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.models.post import PostStatus, Post

class PostService:
    def __init__(self, db: Session):
        self.repository = PostRepository(db)

    def create_post(self, user_id: int, post_in: PostCreate) -> Post:
        return self.repository.create(user_id, post_in)

    def save_draft(self, user_id: int, post_in: PostCreate) -> Post:
        post_in.status = PostStatus.DRAFT
        return self.repository.create(user_id, post_in)

    def get_post(self, post_id: int, user_id: int) -> Post:
        post = self.repository.get_by_id(post_id)
        if not post or post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return post

    def get_user_posts(self, user_id: int, status: Optional[PostStatus] = None) -> List[Post]:
        return self.repository.get_user_posts(user_id, status=status)

    def update_post(self, post_id: int, user_id: int, post_in: PostUpdate) -> Post:
        # Validate existence & ownership
        self.get_post(post_id, user_id)
        updated_post = self.repository.update(post_id, post_in)
        if not updated_post:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not update post")
        return updated_post

    def delete_post(self, post_id: int, user_id: int) -> bool:
        self.get_post(post_id, user_id)
        return self.repository.delete(post_id)
