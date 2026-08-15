from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid

from app.services.social_media.base import SocialMediaPlatform

class FacebookService(SocialMediaPlatform):
    @property
    def platform_name(self) -> str:
        return "facebook"

    async def publish_post(
        self,
        post_id: int,
        content: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Mock publishing for Facebook Page / Feed.
        """
        platform_id = f"fb_post_{uuid.uuid4().hex[:10]}"
        return {
            "success": True,
            "platform": self.platform_name,
            "platform_post_id": platform_id,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Successfully published post #{post_id} to Facebook Page."
        }
