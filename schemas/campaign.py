from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.campaign import CampaignStatus

class CampaignContentBase(BaseModel):
    title: str
    content_type: str = "social_post"
    status: str = "draft"
    channel: str = "general"
    scheduled_time: Optional[datetime] = None
    post_id: Optional[int] = None

class CampaignContentCreate(CampaignContentBase):
    pass

class CampaignContentUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[str] = None
    status: Optional[str] = None
    channel: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    post_id: Optional[int] = None

class CampaignContentResponse(CampaignContentBase):
    id: int
    campaign_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_audience: Optional[str] = None
    budget: Optional[float] = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    status: Optional[CampaignStatus] = CampaignStatus.DRAFT

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CampaignStatus] = None
    target_audience: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignResponse(CampaignBase):
    id: int
    user_id: int
    status: CampaignStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CampaignDetailResponse(CampaignResponse):
    contents: List[CampaignContentResponse] = Field(default_factory=list)
