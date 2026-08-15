from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.audience_repository import AudienceRepository
from app.schemas.audience import (
    AudienceSegmentCreate,
    AudienceSegmentUpdate,
    AudienceOverviewResponse
)
from app.models.audience import AudienceSegment

class AudienceService:
    def __init__(self, db: Session):
        self.repository = AudienceRepository(db)

    def create_segment(self, user_id: int, segment_in: AudienceSegmentCreate) -> AudienceSegment:
        return self.repository.create(user_id, segment_in)

    def get_segment(self, segment_id: int, user_id: int) -> AudienceSegment:
        segment = self.repository.get_by_id(segment_id)
        if not segment or segment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audience segment not found"
            )
        return segment

    def get_user_segments(self, user_id: int) -> List[AudienceSegment]:
        return self.repository.get_user_segments(user_id)

    def update_segment(
        self, segment_id: int, user_id: int, segment_in: AudienceSegmentUpdate
    ) -> AudienceSegment:
        self.get_segment(segment_id, user_id)
        updated = self.repository.update(segment_id, segment_in)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not update audience segment"
            )
        return updated

    def delete_segment(self, segment_id: int, user_id: int) -> bool:
        self.get_segment(segment_id, user_id)
        return self.repository.delete(segment_id)

    def get_overview(self, user_id: int) -> AudienceOverviewResponse:
        segments = self.repository.get_user_segments(user_id)
        total_segments = len(segments)
        total_estimated_reach = sum(s.estimated_size for s in segments)
        active_segments = sum(1 for s in segments if s.is_active)

        segments_by_platform = {}
        for s in segments:
            p = (s.platform or "all").lower()
            segments_by_platform[p] = segments_by_platform.get(p, 0) + 1

        return AudienceOverviewResponse(
            total_segments=total_segments,
            total_estimated_reach=total_estimated_reach,
            active_segments=active_segments,
            segments_by_platform=segments_by_platform
        )
