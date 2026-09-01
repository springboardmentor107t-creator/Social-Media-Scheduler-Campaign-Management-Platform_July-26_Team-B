from typing import Dict
from app.services.social_media.base import SocialMediaPlatform
from app.services.social_media.instagram import InstagramService
from app.services.social_media.facebook import FacebookService
from app.services.social_media.linkedin import LinkedInService
from app.services.social_media.twitter import TwitterService
from app.services.social_media.youtube import YouTubeService
from app.services.social_media.pinterest import PinterestService

class PublisherFactory:
    _services: Dict[str, SocialMediaPlatform] = {
        "instagram": InstagramService(),
        "facebook": FacebookService(),
        "linkedin": LinkedInService(),
        "twitter": TwitterService(),
        "x": TwitterService(),
        "youtube": YouTubeService(),
        "pinterest": PinterestService(),
    }

    @classmethod
    def get_publisher(cls, platform: str) -> SocialMediaPlatform:
        clean_name = platform.lower().strip()
        if clean_name not in cls._services:
            raise ValueError(f"Unsupported social media platform: '{platform}'")
        return cls._services[clean_name]
