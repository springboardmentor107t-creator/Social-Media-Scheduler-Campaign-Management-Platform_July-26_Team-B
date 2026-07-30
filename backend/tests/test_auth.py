import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth_app.db"

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
        db.query(User).delete()
        db.commit()
    finally:
        db.close()

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "password": "Password123!",
            "full_name": "Test Creator",
            "role": "creator"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "creator@example.com"
    assert data["role"] == "creator"
    assert "id" in data

def test_login_user():
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login_test@example.com",
            "password": "Password123!",
            "full_name": "Login User",
            "role": "creator"
        }
    )
    
    # Login via JSON
    response = client.post(
        "/api/v1/auth/login/json",
        json={
            "email": "login_test@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Access /me
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "login_test@example.com"
