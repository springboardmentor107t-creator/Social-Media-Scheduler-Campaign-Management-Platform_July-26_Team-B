from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import engine, Base, close_mongo_connection
from app.routers import auth, posts, schedules, calendar, queue, workflow, logs, analytics, campaigns, reports, audience, social_accounts, users, admin, realtime, external_apis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize relational database tables
    Base.metadata.create_all(bind=engine)
    
    # Run seed function
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        from app.core.seed import seed_data
        seed_data(db)
    except Exception as e:
        import logging
        logging.getLogger("uvicorn").error(f"Failed to seed data: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown resources
    close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local testing and websockets
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audience.router, prefix=settings.API_V1_STR)
app.include_router(social_accounts.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(external_apis.router, prefix=settings.API_V1_STR)
app.include_router(realtime.router)

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
