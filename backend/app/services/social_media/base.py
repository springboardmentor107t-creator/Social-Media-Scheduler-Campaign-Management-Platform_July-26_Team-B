from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class SocialMediaPlatform(ABC):
    """
    Base Interface / Abstract Class for Social Media Integration Layer.
    Allows easy pluggability for future real API client implementations.
    """

    @property
    @abstractmethod
    def platform_name(self) -> str:
        pass

    @abstractmethod
    async def publish_post(
        self,
        post_id: int,
        content: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Publishes content to the designated social media platform.
        Returns a dictionary containing execution metadata (status, platform_post_id, timestamp, etc.).
        """
        pass
