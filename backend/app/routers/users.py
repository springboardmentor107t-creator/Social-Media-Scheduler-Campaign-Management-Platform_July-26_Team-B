from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate
from app.routers.deps import get_current_active_user, require_roles

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get(
    "/",
    response_model=List[UserResponse],
    dependencies=[Depends(require_roles([UserRole.ADMINISTRATOR, UserRole.MARKETING_TEAM, UserRole.BUSINESS_USER]))]
)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all registered users (Accessible to Admins, Marketing Team, Business Users)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve details for a specific user."""
    # Allow self or admin/marketing/business
    if current_user.id != user_id and current_user.role not in [UserRole.ADMINISTRATOR, UserRole.MARKETING_TEAM, UserRole.BUSINESS_USER]:
        raise HTTPException(status_code=403, detail="Not authorized to view this user profile")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_roles([UserRole.ADMINISTRATOR]))]
)
def update_user_by_admin(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user role and details (Administrator only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.email:
        existing = db.query(User).filter(User.email == user_update.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email address is already in use.")
        user.email = user_update.email

    if user_update.full_name is not None:
        user.full_name = user_update.full_name

    if user_update.role is not None:
        user.role = user_update.role

    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    db.commit()
    db.refresh(user)
    return user

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles([UserRole.ADMINISTRATOR]))]
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate or remove user (Administrator only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None
