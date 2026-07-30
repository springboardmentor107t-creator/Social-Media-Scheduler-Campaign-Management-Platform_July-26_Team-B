from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.social_account import SocialPlatform

class SocialAccountBase(BaseModel):
    platform: SocialPlatform
    account_name: str
    platform_user_id: Optional[str] = None

class SocialAccountCreate(SocialAccountBase):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None

class SocialAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_connected: Optional[bool] = None

class SocialAccountResponse(SocialAccountBase):
    id: int
    user_id: int
    is_connected: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
