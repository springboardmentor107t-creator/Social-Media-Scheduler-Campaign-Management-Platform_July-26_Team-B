from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Create test user
    test_user = User(
        username="testuser",
        email="testuser@example.com",
        hashed_password=get_password_hash("password123"),
        role="user"
    )
    db.add(test_user)
    db.commit()
    db.close()

def test_post_management_crud():
    # Create Draft
    resp = client.post("/api/v1/posts/draft", json={
        "content": "My first draft post",
        "platforms": ["instagram", "facebook"]
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "draft"
    assert data["content"] == "My first draft post"
    post_id = data["id"]

    # Read Post
    resp = client.get(f"/api/v1/posts/{post_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == post_id

    # Update Post
    resp = client.put(f"/api/v1/posts/{post_id}", json={
        "content": "Updated draft post content"
    })
    assert resp.status_code == 200
    assert resp.json()["content"] == "Updated draft post content"

    # List Posts
    resp = client.get("/api/v1/posts")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # Delete Post
    resp = client.delete(f"/api/v1/posts/{post_id}")
    assert resp.status_code == 204

def test_content_scheduling_and_calendar():
    # Create Post
    resp = client.post("/api/v1/posts", json={
        "content": "Scheduled Post Content",
        "platforms": ["twitter", "linkedin"],
        "is_recurring": True,
        "recurrence_pattern": "daily"
    })
    post_id = resp.json()["id"]

    # Schedule Post
    sched_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    resp = client.post("/api/v1/schedules", json={
        "post_id": post_id,
        "scheduled_time": sched_time
    })
    assert resp.status_code == 201
    sched_data = resp.json()
    assert sched_data["status"] == "pending"
    sched_id = sched_data["id"]

    # Retrieve Schedules
    resp = client.get("/api/v1/schedules")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # Calendar API Date Range Filter
    start_date = datetime.now(timezone.utc).isoformat()
    end_date = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    resp = client.get("/api/v1/calendar", params={"start_date": start_date, "end_date": end_date})
    assert resp.status_code == 200
    assert len(resp.json()) == 1

def test_publishing_queue_and_workflow():
    # Create Post due right now
    resp = client.post("/api/v1/posts", json={
        "content": "Workflow Auto Publish Post",
        "platforms": ["instagram", "facebook", "linkedin", "twitter"],
        "is_recurring": True,
        "recurrence_pattern": "weekly"
    })
    post_id = resp.json()["id"]

    past_time = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    resp = client.post("/api/v1/schedules", json={
        "post_id": post_id,
        "scheduled_time": past_time
    })
    sched_id = resp.json()["id"]

    # Trigger Publishing Workflow
    resp = client.post("/api/v1/workflow/trigger")
    assert resp.status_code == 200
    result = resp.json()["result"]
    assert result["due_schedules_found"] >= 1
    assert result["successfully_published"] >= 1
    assert result["recurring_schedules_generated"] == 1

    # Check Queue Items
    resp = client.get("/api/v1/queue")
    assert resp.status_code == 200
    queue_items = resp.json()
    assert len(queue_items) >= 4  # 4 platforms

def test_publishing_logs_api():
    resp = client.get("/api/v1/publishing-logs")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_analytics_api():
    # Store Analytics
    resp = client.post("/api/v1/analytics", json={
        "post_id": 1,
        "platform": "instagram",
        "likes": 150,
        "comments": 25,
        "shares": 10,
        "engagement_metrics": {
            "impressions": 2000,
            "reach": 1500,
            "engagement_rate": 9.25
        }
    })
    assert resp.status_code == 201

    # Get by Post
    resp = client.get("/api/v1/analytics/post/1")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1
    assert resp.json()[0]["likes"] == 150

    # Get Summary
    resp = client.get("/api/v1/analytics/summary")
    assert resp.status_code == 200
    assert resp.json()["total_likes"] >= 150
