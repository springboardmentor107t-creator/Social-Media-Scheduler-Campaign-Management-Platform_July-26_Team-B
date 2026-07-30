import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.social_account import SocialAccount

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sa_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
Base.metadata.create_all(bind=engine)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def clean_tables():
    db = TestingSessionLocal()
    try:
        db.query(SocialAccount).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()

client = TestClient(app)

def test_social_account_flow():
    # 1. Register & Login
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "social_user@example.com",
            "password": "Password123!",
            "full_name": "Social User",
            "role": "marketing"
        }
    )
    login_resp = client.post(
        "/api/v1/auth/login/json",
        json={"email": "social_user@example.com", "password": "Password123!"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Connect Facebook Account
    connect_resp = client.post(
        "/api/v1/social-accounts/connect",
        json={
            "platform": "facebook",
            "account_name": "My Business Page",
            "platform_user_id": "fb_123456",
            "access_token": "mock_fb_token"
        },
        headers=headers
    )
    assert connect_resp.status_code == 201
    account_data = connect_resp.json()
    assert account_data["platform"] == "facebook"
    assert account_data["account_name"] == "My Business Page"
    account_id = account_data["id"]

    # 3. List Accounts
    list_resp = client.get("/api/v1/social-accounts/", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # 4. Sync Account
    sync_resp = client.post(f"/api/v1/social-accounts/{account_id}/sync", headers=headers)
    assert sync_resp.status_code == 200
    assert sync_resp.json()["status"] == "success"

    # 5. Disconnect Account
    del_resp = client.delete(f"/api/v1/social-accounts/{account_id}", headers=headers)
    assert del_resp.status_code == 204
