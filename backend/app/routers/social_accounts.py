from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])

# In-memory storage for mock social accounts since DB model is not implemented
mock_db = {}

@router.get("/", response_model=List[Dict[str, Any]])
def get_social_accounts(current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    if user_id not in mock_db:
        mock_db[user_id] = []
    return mock_db[user_id]

class ConnectAccount(BaseModel):
    platform: str
    account_name: str
    platform_user_id: str
    access_token: str

@router.post("/connect")
def connect_account(data: ConnectAccount, current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    if user_id not in mock_db:
        mock_db[user_id] = []
    
    new_account = {
        "id": str(uuid.uuid4()),
        "platform": data.platform,
        "account_name": data.account_name,
        "platform_user_id": data.platform_user_id
    }
    mock_db[user_id].append(new_account)
    return {"status": "connected", "account": new_account}

@router.delete("/{account_id}")
def disconnect_account(account_id: str, current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    if user_id in mock_db:
        mock_db[user_id] = [acc for acc in mock_db[user_id] if acc["id"] != account_id]
    return {"status": "disconnected"}
