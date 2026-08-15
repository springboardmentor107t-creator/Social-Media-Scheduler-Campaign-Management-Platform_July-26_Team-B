from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging
from sqlalchemy.orm import Session

from app.database import get_mongo_db
from app.models.analytics import AnalyticsRecord
from app.schemas.analytics import AnalyticsCreate, AnalyticsRecordCreate

logger = logging.getLogger(__name__)

# Fallback in-memory store for analytics if MongoDB is unavailable
_in_memory_analytics: Dict[str, Dict[str, Any]] = {}

class AnalyticsRepository:
    def __init__(self, db: Optional[Session] = None):
        self.db_session = db
        self.mongo_db = get_mongo_db()

    async def upsert_analytics(self, analytics_in: AnalyticsCreate) -> Dict[str, Any]:
        data = analytics_in.model_dump()
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        key = f"{data.get('post_id')}_{data.get('platform')}"

        if self.mongo_db is not None:
            try:
                collection = self.mongo_db["analytics"]
                await collection.update_one(
                    {"post_id": data.get("post_id"), "platform": data.get("platform")},
                    {"$set": data},
                    upsert=True
                )
                doc = await collection.find_one({"post_id": data.get("post_id"), "platform": data.get("platform")})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
            except Exception as e:
                logger.warning(f"MongoDB write failed, storing analytics in memory fallback: {e}")

        # Fallback
        data["_id"] = key
        _in_memory_analytics[key] = data
        return data

    async def get_by_post(self, post_id: int) -> List[Dict[str, Any]]:
        if self.mongo_db is not None:
            try:
                collection = self.mongo_db["analytics"]
                cursor = collection.find({"post_id": post_id})
                results = await cursor.to_list(length=50)
                for doc in results:
                    doc["_id"] = str(doc["_id"])
                return results
            except Exception as e:
                logger.warning(f"MongoDB query failed, reading from memory fallback: {e}")

        # Fallback
        return [v for v in _in_memory_analytics.values() if v.get("post_id") == post_id]

    async def get_summary(self) -> Dict[str, Any]:
        records = []
        if self.mongo_db is not None:
            try:
                collection = self.mongo_db["analytics"]
                cursor = collection.find()
                records = await cursor.to_list(length=500)
            except Exception as e:
                logger.warning(f"MongoDB summary query failed, reading memory fallback: {e}")
                records = list(_in_memory_analytics.values())
        else:
            records = list(_in_memory_analytics.values())

        total_likes = sum(r.get("likes", 0) for r in records)
        total_comments = sum(r.get("comments", 0) for r in records)
        total_shares = sum(r.get("shares", 0) for r in records)

        return {
            "total_posts_tracked": len(records),
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "records": records
        }

    def create_record(self, user_id: int, record_in: AnalyticsRecordCreate) -> AnalyticsRecord:
        if not self.db_session:
            raise ValueError("Relational Session is required for DB operations")
        
        db_record = AnalyticsRecord(
            user_id=user_id,
            post_id=record_in.post_id,
            campaign_id=record_in.campaign_id,
            platform=record_in.platform,
            impressions=record_in.impressions,
            reach=record_in.reach,
            likes=record_in.likes,
            comments=record_in.comments,
            shares=record_in.shares,
            clicks=record_in.clicks,
            engagement_rate=record_in.engagement_rate,
            metric_date=record_in.metric_date if record_in.metric_date is not None else datetime.now(timezone.utc)
        )
        self.db_session.add(db_record)
        self.db_session.commit()
        self.db_session.refresh(db_record)
        return db_record

    def get_campaign_analytics(self, user_id: int, campaign_id: int) -> List[AnalyticsRecord]:
        if not self.db_session:
            return []
        return self.db_session.query(AnalyticsRecord).filter(
            AnalyticsRecord.user_id == user_id,
            AnalyticsRecord.campaign_id == campaign_id
        ).order_by(AnalyticsRecord.metric_date.desc()).all()

    def get_user_analytics_records(self, user_id: int) -> List[AnalyticsRecord]:
        if not self.db_session:
            return []
        return self.db_session.query(AnalyticsRecord).filter(
            AnalyticsRecord.user_id == user_id
        ).order_by(AnalyticsRecord.metric_date.desc()).all()
