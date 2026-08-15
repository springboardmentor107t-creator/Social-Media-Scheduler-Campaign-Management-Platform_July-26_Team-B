from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field

class AudienceSegmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    demographics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    interests: Optional[List[str]] = Field(default_factory=list)
    platform: Optional[str] = "all"
    estimated_size: Optional[int] = 0
    is_active: Optional[bool] = True

class AudienceSegmentCreate(AudienceSegmentBase):
    pass

class AudienceSegmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    demographics: Optional[Dict[str, Any]] = None
    interests: Optional[List[str]] = None
    platform: Optional[str] = None
    estimated_size: Optional[int] = None
    is_active: Optional[bool] = None

class AudienceSegmentResponse(AudienceSegmentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AudienceOverviewResponse(BaseModel):
    total_segments: int = 0
    total_estimated_reach: int = 0
    active_segments: int = 0
    segments_by_platform: Dict[str, int] = Field(default_factory=dict)
