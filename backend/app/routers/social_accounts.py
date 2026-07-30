from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount, SocialPlatform
from app.schemas.social_account import (
    SocialAccountCreate,
    SocialAccountResponse,
    SocialAccountUpdate
)
from app.routers.deps import get_current_active_user

router = APIRouter(prefix="/social-accounts", tags=["Social Account Integration"])

@router.get("/", response_model=List[SocialAccountResponse])
def get_user_social_accounts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all social media accounts connected by current user."""
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == current_user.id).all()
    return accounts

@router.post("/connect", response_model=SocialAccountResponse, status_code=status.HTTP_201_CREATED)
def connect_social_account(
    account_in: SocialAccountCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Connect a new social media profile (Facebook, Instagram, LinkedIn, Twitter, YouTube, Pinterest)."""
    # Check if account already exists for user on this platform with same handle/ID
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.platform == account_in.platform,
        SocialAccount.account_name == account_in.account_name
    ).first()

    if existing:
        # Update existing connection with new tokens if provided
        existing.access_token = account_in.access_token or existing.access_token
        existing.refresh_token = account_in.refresh_token or existing.refresh_token
        existing.platform_user_id = account_in.platform_user_id or existing.platform_user_id
        existing.is_connected = True
        existing.token_expires_at = account_in.token_expires_at or existing.token_expires_at
        db.commit()
        db.refresh(existing)
        return existing

    new_account = SocialAccount(
        user_id=current_user.id,
        platform=account_in.platform,
        account_name=account_in.account_name,
        platform_user_id=account_in.platform_user_id,
        access_token=account_in.access_token,
        refresh_token=account_in.refresh_token,
        token_expires_at=account_in.token_expires_at,
        is_connected=True
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.get("/{account_id}", response_model=SocialAccountResponse)
def get_social_account_details(
    account_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get details for a connected social account."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    return account

@router.put("/{account_id}", response_model=SocialAccountResponse)
def update_social_account(
    account_id: int,
    account_update: SocialAccountUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update connection tokens or status for a social account."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")

    if account_update.account_name is not None:
        account.account_name = account_update.account_name
    if account_update.access_token is not None:
        account.access_token = account_update.access_token
    if account_update.refresh_token is not None:
        account.refresh_token = account_update.refresh_token
    if account_update.token_expires_at is not None:
        account.token_expires_at = account_update.token_expires_at
    if account_update.is_connected is not None:
        account.is_connected = account_update.is_connected

    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def disconnect_social_account(
    account_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Disconnect/remove a social media account connection."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    db.delete(account)
    db.commit()
    return None

@router.post("/{account_id}/sync", response_model=Dict[str, Any])
def sync_social_account(
    account_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Trigger synchronization check with platform API for token status & account health."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    # Simulate API token & permissions validation check
    synced_at = datetime.now(timezone.utc)
    return {
        "status": "success",
        "account_id": account.id,
        "platform": account.platform,
        "account_name": account.account_name,
        "is_connected": account.is_connected,
        "synced_at": synced_at.isoformat(),
        "permissions": ["read_profile", "publish_posts", "read_insights"],
        "message": f"Successfully synchronized {account.platform.value.title()} account '{account.account_name}'"
    }
