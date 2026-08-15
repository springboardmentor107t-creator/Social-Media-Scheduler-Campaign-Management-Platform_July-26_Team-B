from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audience import AudienceSegment
from app.schemas.audience import AudienceSegmentCreate, AudienceSegmentUpdate

class AudienceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, segment_in: AudienceSegmentCreate) -> AudienceSegment:
        db_segment = AudienceSegment(
            user_id=user_id,
            name=segment_in.name,
            description=segment_in.description,
            demographics=segment_in.demographics,
            interests=segment_in.interests,
            platform=segment_in.platform or 'all',
            estimated_size=segment_in.estimated_size or 0,
            is_active=segment_in.is_active if segment_in.is_active is not None else True
        )
        self.db.add(db_segment)
        self.db.commit()
        self.db.refresh(db_segment)
        return db_segment

    def get_by_id(self, segment_id: int) -> Optional[AudienceSegment]:
        return self.db.query(AudienceSegment).filter(AudienceSegment.id == segment_id).first()

    def get_user_segments(self, user_id: int, skip: int = 0, limit: int = 100) -> List[AudienceSegment]:
        return self.db.query(AudienceSegment).filter(AudienceSegment.user_id == user_id).order_by(AudienceSegment.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, segment_id: int, segment_in: AudienceSegmentUpdate) -> Optional[AudienceSegment]:
        db_segment = self.get_by_id(segment_id)
        if not db_segment:
            return None
        update_data = segment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_segment, field, value)
        self.db.commit()
        self.db.refresh(db_segment)
        return db_segment

    def delete(self, segment_id: int) -> bool:
        db_segment = self.get_by_id(segment_id)
        if not db_segment:
            return False
        self.db.delete(db_segment)
        self.db.commit()
        return True
