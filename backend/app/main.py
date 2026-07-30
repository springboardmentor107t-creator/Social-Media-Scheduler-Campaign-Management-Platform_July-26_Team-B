from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import init_db
from app.routers import auth_router, users_router, social_accounts_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables automatically on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SocialPilot Backend API - Social Media Scheduler & Campaign Management Platform (Milestone 1)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(social_accounts_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health & Info"])
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "milestone": "Milestone 1 - Core Backend & Authentication",
        "documentation": "/docs"
    }

@app.get("/health", tags=["Health & Info"])
def health_check():
    return {"status": "healthy"}
