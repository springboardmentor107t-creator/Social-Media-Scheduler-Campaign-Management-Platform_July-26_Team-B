from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field

class EngagementMetrics(BaseModel):
    impressions: Optional[int] = 0
    reach: Optional[int] = 0
    engagement_rate: Optional[float] = 0.0
    clicks: Optional[int] = 0
    extra: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AnalyticsBase(BaseModel):
    post_id: Optional[int] = None
    campaign_id: Optional[int] = None
    platform: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    impressions: int = 0
    reach: int = 0
    engagement_rate: float = 0.0
    engagement_metrics: Optional[EngagementMetrics] = Field(default_factory=EngagementMetrics)

class AnalyticsCreate(AnalyticsBase):
    pass

class AnalyticsUpdate(BaseModel):
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    clicks: Optional[int] = None
    impressions: Optional[int] = None
    reach: Optional[int] = None
    engagement_rate: Optional[float] = None
    engagement_metrics: Optional[EngagementMetrics] = None

class AnalyticsResponse(AnalyticsBase):
    id: Optional[Any] = Field(default=None, alias="_id")
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class AnalyticsRecordCreate(BaseModel):
    post_id: Optional[int] = None
    campaign_id: Optional[int] = None
    platform: str
    impressions: int = 0
    reach: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    engagement_rate: float = 0.0
    metric_date: Optional[datetime] = None

class AnalyticsRecordResponse(AnalyticsRecordCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyticsOverview(BaseModel):
    total_impressions: int = 0
    total_reach: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    total_clicks: int = 0
    avg_engagement_rate: float = 0.0
    platform_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
