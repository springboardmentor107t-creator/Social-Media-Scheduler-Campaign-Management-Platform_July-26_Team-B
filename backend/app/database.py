import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

connect_args = {}
database_url = settings.DATABASE_URL

if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection attempt
    with engine.connect() as conn:
        pass
    logger.info(f"Successfully connected to database: {database_url.split('@')[-1]}")
except Exception as e:
    logger.warning(f"Could not connect to configured DATABASE_URL ({database_url}): {e}")
    logger.warning("Falling back to local SQLite database: sqlite:///./socialpilot.db")
    fallback_url = "sqlite:///./socialpilot.db"
    engine = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for obtaining database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)

# MongoDB Connection Helper (for logs, analytics, un-structured data)
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongo_db = mongo_client[settings.MONGODB_DB_NAME]
except Exception as e:
    logger.warning(f"MongoDB connection init warning: {e}")
    mongo_client = None
    mongo_db = None

def get_mongo_db():
    """Dependency for obtaining MongoDB database instance."""
    return mongo_db

