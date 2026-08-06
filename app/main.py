from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database import engine, Base, close_mongo_connection
from app.routers import auth, posts, schedules, calendar, queue, workflow, logs, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize relational database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown resources
    close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(posts.router, prefix=settings.API_V1_STR)
app.include_router(schedules.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(queue.router, prefix=settings.API_V1_STR)
app.include_router(workflow.router, prefix=settings.API_V1_STR)
app.include_router(logs.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to SocialPilot Content Scheduling & Publishing Engine API",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
