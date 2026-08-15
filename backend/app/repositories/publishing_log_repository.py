from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging

from app.database import get_mongo_db
from app.schemas.publishing_log import PublishingLogCreate

logger = logging.getLogger(__name__)

# Fallback in-memory store if MongoDB is not available in environment
_in_memory_logs: List[Dict[str, Any]] = []

class PublishingLogRepository:
    def __init__(self):
        self.db = get_mongo_db()

    async def log_event(self, log_in: PublishingLogCreate) -> Dict[str, Any]:
        log_doc = log_in.model_dump()
        log_doc["timestamp"] = log_doc.get("timestamp") or datetime.now(timezone.utc).isoformat()
        
        if self.db is not None:
            try:
                collection = self.db["publishing_logs"]
                result = await collection.insert_one(log_doc)
                log_doc["_id"] = str(result.inserted_id)
                return log_doc
            except Exception as e:
                logger.warning(f"MongoDB write failed, storing log in memory fallback: {e}")

        # Fallback
        log_doc["_id"] = f"log_{len(_in_memory_logs) + 1}"
        _in_memory_logs.append(log_doc)
        return log_doc

    async def get_logs_by_post(self, post_id: int) -> List[Dict[str, Any]]:
        if self.db is not None:
            try:
                collection = self.db["publishing_logs"]
                cursor = collection.find({"post_id": post_id}).sort("timestamp", -1)
                logs = await cursor.to_list(length=100)
                for log in logs:
                    log["_id"] = str(log["_id"])
                return logs
            except Exception as e:
                logger.warning(f"MongoDB query failed, reading from memory fallback: {e}")

        # Fallback
        return [l for l in _in_memory_logs if l.get("post_id") == post_id]

    async def get_all_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self.db is not None:
            try:
                collection = self.db["publishing_logs"]
                cursor = collection.find().sort("timestamp", -1).limit(limit)
                logs = await cursor.to_list(length=limit)
                for log in logs:
                    log["_id"] = str(log["_id"])
                return logs
            except Exception as e:
                logger.warning(f"MongoDB query failed, reading from memory fallback: {e}")

        # Fallback
        return list(reversed(_in_memory_logs))[:limit]
