from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, get_current_user

client = TestClient(app)

# Global test user reference
current_test_user_id = None

def override_get_current_user():
    global current_test_user_id
    db = SessionLocal()
    if current_test_user_id:
        user = db.query(User).filter(User.id == current_test_user_id).first()
    else:
        user = db.query(User).first()
    db.close()
    return user

@pytest.fixture(autouse=True)
def setup_db():
    global current_test_user_id
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    test_user = User(
        username="testuser",
        email="testuser@example.com",
        hashed_password=get_password_hash("password123"),
        role="admin"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    current_test_user_id = test_user.id
    db.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()

def test_auth_me_and_password_update():
    # 1. Test GET /auth/me
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["username"] == "testuser"

    # 2. Test PUT /auth/me
    resp = client.put("/api/v1/auth/me", json={
        "full_name": "Senior Developer",
        "email": "seniordev@example.com"
    })
    assert resp.status_code == 200
    assert resp.json()["username"] == "Senior Developer"
    assert resp.json()["email"] == "seniordev@example.com"

    # 3. Test PUT /auth/change-password
    resp = client.put("/api/v1/auth/change-password", json={
        "current_password": "password123",
        "new_password": "newsecretpassword123"
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"

def test_social_accounts_persistence():
    # 1. Connect Account
    resp = client.post("/api/v1/social-accounts/connect", json={
        "platform": "twitter",
        "account_name": "@DevPilotOfficial",
        "platform_user_id": "tw_987654"
    })
    assert resp.status_code == 201
    acc_id = resp.json()["account"]["id"]

    # 2. List Accounts
    resp = client.get("/api/v1/social-accounts")
    assert resp.status_code == 200
    accounts = resp.json()
    assert len(accounts) == 1
    assert accounts[0]["account_name"] == "@DevPilotOfficial"

    # 3. Disconnect Account
    resp = client.delete(f"/api/v1/social-accounts/{acc_id}")
    assert resp.status_code == 200

    resp = client.get("/api/v1/social-accounts")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

def test_post_creation_with_direct_schedule():
    sched_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    resp = client.post("/api/v1/posts", json={
        "content": "Automated schedule post test",
        "platforms": ["twitter", "linkedin"],
        "media_urls": ["https://images.unsplash.com/photo-1"],
        "status": "scheduled",
        "scheduled_at": sched_time
    })
    assert resp.status_code == 201
    post = resp.json()
    assert post["status"] == "scheduled"
    assert post["scheduled_at"] is not None

def test_campaign_management():
    # 1. Create Campaign
    resp = client.post("/api/v1/campaigns", json={
        "name": "Q4 Growth Sprint",
        "description": "Cross-channel growth initiatives",
        "status": "active",
        "budget": 3500.0,
        "target_audience": "Startups & Agencies",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    })
    assert resp.status_code == 201
    camp_id = resp.json()["id"]

    # 2. List Campaigns
    resp = client.get("/api/v1/campaigns")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # 3. Get Campaign Detail
    resp = client.get(f"/api/v1/campaigns/{camp_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Q4 Growth Sprint"

def test_audience_and_analytics():
    # 1. Audience Overview
    resp = client.get("/api/v1/audience/overview")
    assert resp.status_code == 200
    assert "total_segments" in resp.json()

    # 2. Audience Segment Create
    resp = client.post("/api/v1/audience/segments", json={
        "name": "Enterprise Marketers",
        "description": "High LTV decision makers",
        "estimated_reach": 25000,
        "criteria": {"industries": ["SaaS", "FinTech"]}
    })
    assert resp.status_code == 201
    seg_id = resp.json()["id"]

    # 3. List Segments
    resp = client.get("/api/v1/audience/segments")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

def test_reports_and_export():
    # 1. Reports Overview
    resp = client.get("/api/v1/reports/overview")
    assert resp.status_code == 200
    assert "total_posts" in resp.json()

    # 2. Reports Comparison
    resp = client.get("/api/v1/reports/comparison")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # 3. CSV Export
    resp = client.get("/api/v1/reports/export/csv")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")

