from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class EngagementMetrics(BaseModel):
    impressions: Optional[int] = 0
    reach: Optional[int] = 0
    engagement_rate: Optional[float] = 0.0
    clicks: Optional[int] = 0
    extra: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AnalyticsBase(BaseModel):
    post_id: int
    platform: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_metrics: Optional[EngagementMetrics] = Field(default_factory=EngagementMetrics)

class AnalyticsCreate(AnalyticsBase):
    pass

class AnalyticsUpdate(BaseModel):
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    engagement_metrics: Optional[EngagementMetrics] = None

class AnalyticsResponse(AnalyticsBase):
    id: Optional[str] = Field(default=None, alias="_id")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
