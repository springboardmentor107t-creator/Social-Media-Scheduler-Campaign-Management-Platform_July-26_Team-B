from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy Setup
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB Setup using Motor / PyMongo
mongo_client = None

def get_mongo_db():
    """
    Returns Motor async database instance or fallback PyMongo client.
    """
    global mongo_client
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        if mongo_client is None:
            mongo_client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
        return mongo_client[settings.MONGODB_DB_NAME]
    except Exception as e:
        logger.warning(f"Failed to initialize Motor MongoDB client: {e}")
        return None

def close_mongo_connection():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        mongo_client = None
