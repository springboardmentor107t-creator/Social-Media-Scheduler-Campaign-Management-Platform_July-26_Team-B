from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount
from app.core.security import get_current_user

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])

class ConnectAccount(BaseModel):
    platform: str
    account_name: str
    platform_user_id: str
    access_token: Optional[str] = None

class SocialAccountResponse(BaseModel):
    id: str
    platform: str
    account_name: str
    platform_user_id: str
    is_active: bool = True

@router.get("", response_model=List[SocialAccountResponse])
@router.get("/", response_model=List[SocialAccountResponse])
def get_social_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).all()
    return [
        SocialAccountResponse(
            id=str(acc.id),
            platform=acc.platform,
            account_name=acc.account_name,
            platform_user_id=acc.platform_user_id,
            is_active=acc.is_active
        )
        for acc in accounts
    ]

@router.post("/connect", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def connect_account(
    data: ConnectAccount,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.platform == data.platform.lower(),
        SocialAccount.platform_user_id == data.platform_user_id
    ).first()

    if existing:
        existing.account_name = data.account_name
        existing.is_active = True
        if data.access_token:
            existing.access_token = data.access_token
        db.commit()
        db.refresh(existing)
        acc_obj = existing
    else:
        acc_obj = SocialAccount(
            user_id=current_user.id,
            platform=data.platform.lower(),
            account_name=data.account_name,
            platform_user_id=data.platform_user_id,
            access_token=data.access_token or "mock_access_token_tokenized",
            is_active=True
        )
        db.add(acc_obj)
        db.commit()
        db.refresh(acc_obj)

    return {
        "status": "connected",
        "account": {
            "id": str(acc_obj.id),
            "platform": acc_obj.platform,
            "account_name": acc_obj.account_name,
            "platform_user_id": acc_obj.platform_user_id,
            "is_active": acc_obj.is_active
        }
    }

@router.delete("/{account_id}")
def disconnect_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        acc_id_int = int(account_id)
        account = db.query(SocialAccount).filter(
            SocialAccount.id == acc_id_int,
            SocialAccount.user_id == current_user.id
        ).first()
        if account:
            db.delete(account)
            db.commit()
    except ValueError:
        pass
    return {"status": "disconnected"}
