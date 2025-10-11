"""Tests for Portfolio Management API"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.models.database import Base, get_db

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_read_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Portfolio Management" in response.json()["message"]

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_user():
    """Test user creation"""
    response = client.post(
        "/api/users/",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_create_portfolio():
    """Test portfolio creation"""
    # First create a user
    user_response = client.post(
        "/api/users/",
        json={
            "username": "portfoliouser",
            "email": "portfolio@example.com",
            "password": "testpass123"
        }
    )
    user_id = user_response.json()["id"]
    
    # Create portfolio
    response = client.post(
        f"/api/portfolios/?user_id={user_id}",
        json={
            "name": "My Portfolio",
            "description": "Test portfolio"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Portfolio"
    assert data["user_id"] == user_id

def test_list_assets():
    """Test listing assets"""
    response = client.get("/api/assets/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_asset_info():
    """Test getting asset info"""
    response = client.get("/api/assets/AAPL/info")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data

# Cleanup
import os
if os.path.exists("test.db"):
    os.remove("test.db")
