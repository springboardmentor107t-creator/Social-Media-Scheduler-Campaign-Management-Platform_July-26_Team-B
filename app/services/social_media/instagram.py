from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid

from app.services.social_media.base import SocialMediaPlatform

class InstagramService(SocialMediaPlatform):
    @property
    def platform_name(self) -> str:
        return "instagram"

    async def publish_post(
        self,
        post_id: int,
        content: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Mock publishing for Instagram.
        In real integration, this calls Graph API / media container publish.
        """
        platform_id = f"ig_post_{uuid.uuid4().hex[:10]}"
        return {
            "success": True,
            "platform": self.platform_name,
            "platform_post_id": platform_id,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Successfully published post #{post_id} to Instagram.",
            "media_count": len(media_urls) if media_urls else 0
        }
