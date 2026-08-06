from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging

from app.database import get_mongo_db
from app.schemas.analytics import AnalyticsCreate, AnalyticsUpdate

logger = logging.getLogger(__name__)

# Fallback in-memory store for analytics if MongoDB is unavailable
_in_memory_analytics: Dict[str, Dict[str, Any]] = {}

class AnalyticsRepository:
    def __init__(self):
        self.db = get_mongo_db()

    async def upsert_analytics(self, analytics_in: AnalyticsCreate) -> Dict[str, Any]:
        data = analytics_in.model_dump()
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        key = f"{data['post_id']}_{data['platform']}"

        if self.db is not None:
            try:
                collection = self.db["analytics"]
                result = await collection.update_one(
                    {"post_id": data["post_id"], "platform": data["platform"]},
                    {"$set": data},
                    upsert=True
                )
                doc = await collection.find_one({"post_id": data["post_id"], "platform": data["platform"]})
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
        if self.db is not None:
            try:
                collection = self.db["analytics"]
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
        if self.db is not None:
            try:
                collection = self.db["analytics"]
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
