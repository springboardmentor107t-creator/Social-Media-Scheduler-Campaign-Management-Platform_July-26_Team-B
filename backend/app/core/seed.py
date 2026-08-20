from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.post import Post, PostStatus
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_content import CampaignContent
from app.models.analytics import AnalyticsRecord
from app.models.audience import AudienceSegment
from app.core.security import get_password_hash
import random

def seed_data(db: Session):
    # Ensure users of all roles exist
    seed_users_data = [
        {"username": "admin", "email": "admin@socialpilot.io", "role": "admin", "password": "adminpassword"},
        {"username": "sarah_creator", "email": "sarah@socialpilot.io", "role": "creator", "password": "password123"},
        {"username": "alex_marketing", "email": "alex@socialpilot.io", "role": "marketing", "password": "password123"},
        {"username": "david_business", "email": "david@socialpilot.io", "role": "business", "password": "password123"},
        {"username": "testuser", "email": "testuser@example.com", "role": "admin", "password": "testpassword"},
    ]
    created_users = {}
    for u_data in seed_users_data:
        existing = db.query(User).filter(User.username == u_data["username"]).first()
        if not existing:
            u_obj = User(
                username=u_data["username"],
                email=u_data["email"],
                hashed_password=get_password_hash(u_data["password"]),
                role=u_data["role"]
            )
            db.add(u_obj)
            db.commit()
            db.refresh(u_obj)
            created_users[u_data["username"]] = u_obj
        else:
            created_users[u_data["username"]] = existing
            
    user = created_users.get("testuser") or created_users.get("alex_marketing")

    # Check if we already have campaigns seeded to avoid duplicates
    if db.query(Campaign).first() is not None:
        return

    # 2. Seed Campaigns
    campaigns = [
        Campaign(
            user_id=user.id,
            name="Summer Product Launch",
            description="Promotion campaign for our flagship product launch in Summer 2026. Focusing on tech features, early bird discounts, and user testimonials.",
            status=CampaignStatus.ACTIVE,
            target_audience="Tech Enthusiasts, Early Adopters, 18-35 age range",
            budget=5000.0,
            start_date=datetime.now(timezone.utc) - timedelta(days=15),
            end_date=datetime.now(timezone.utc) + timedelta(days=15)
        ),
        Campaign(
            user_id=user.id,
            name="Holiday Brand Awareness",
            description="Increase brand visibility during the end of year holidays. Focus on emotional storytelling, gifts, and seasonal values.",
            status=CampaignStatus.DRAFT,
            target_audience="General Consumers, gift shoppers",
            budget=2500.0,
            start_date=datetime.now(timezone.utc) + timedelta(days=30),
            end_date=datetime.now(timezone.utc) + timedelta(days=45)
        ),
        Campaign(
            user_id=user.id,
            name="Spring Clearance Campaign",
            description="Clear out inventory of older models with a heavy clearance sale. Targeted at budget shoppers and existing email list subscribers.",
            status=CampaignStatus.COMPLETED,
            target_audience="Existing Customers, price-sensitive buyers",
            budget=1200.0,
            start_date=datetime.now(timezone.utc) - timedelta(days=60),
            end_date=datetime.now(timezone.utc) - timedelta(days=45)
        )
    ]
    for c in campaigns:
        db.add(c)
    db.commit()
    for c in campaigns:
        db.refresh(c)
    print("Seeded campaigns.")

    summer_camp = campaigns[0]
    clearance_camp = campaigns[2]

    # 3. Seed Posts & Campaign Contents
    posts_data = [
        # Summer Launch posts
        {
            "content": "Sneak peek alert! 🚀 The next generation of SocialPilot is launching soon. Get ready for automated campaigns and deep analytics like never before. Sign up for early access! #TechLaunch #SocialPilot",
            "platforms": ["twitter", "linkedin"],
            "status": PostStatus.PUBLISHED,
            "campaign_id": summer_camp.id,
            "title": "SocialPilot NextGen Sneak Peek",
            "channel": "twitter",
            "content_type": "social_post"
        },
        {
            "content": "Running multiple campaigns and struggle with ROI? Our upcoming analytics dashboard lets you track engagement, impressions, and follower growth in real-time. Link in bio! 📊✨ #MarketingTech #DataAnalytics",
            "platforms": ["instagram", "facebook"],
            "status": PostStatus.PUBLISHED,
            "campaign_id": summer_camp.id,
            "title": "ROI Dashboard Teaser",
            "channel": "instagram",
            "content_type": "social_post"
        },
        {
            "content": "How do you manage your brand's social footprint? Learn how SocialPilot helped a SaaS startup grow its active audience by 45% in just 3 months. Read our full case study now! 📈🔗",
            "platforms": ["linkedin", "facebook"],
            "status": PostStatus.PUBLISHED,
            "campaign_id": summer_camp.id,
            "title": "SaaS Case Study Post",
            "channel": "linkedin",
            "content_type": "social_post"
        },
        # Clearance posts
        {
            "content": "Spring Clearance is officially LIVE! 🌸 Get up to 50% off on all annual premium subscriptions. This deal is valid for 72 hours only. Don't miss out, upgrade today! 💻🔥 #Clearance #Sale",
            "platforms": ["facebook", "twitter"],
            "status": PostStatus.PUBLISHED,
            "campaign_id": clearance_camp.id,
            "title": "Clearance Sale Announcement",
            "channel": "facebook",
            "content_type": "social_post"
        }
    ]

    for p_info in posts_data:
        post = Post(
            user_id=user.id,
            content=p_info["content"],
            platforms=p_info["platforms"],
            status=p_info["status"]
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # Link to CampaignContent
        camp_content = CampaignContent(
            campaign_id=p_info["campaign_id"],
            post_id=post.id,
            title=p_info["title"],
            content_type=p_info["content_type"],
            status="published",
            channel=p_info["channel"],
            scheduled_time=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(camp_content)
    db.commit()
    print("Seeded posts and campaign contents.")

    # 4. Seed Analytics Records for charts
    # We want records for the last 14 days for the active campaign
    platforms = ["instagram", "facebook", "linkedin", "twitter"]
    for day in range(14, 0, -1):
        metric_date = datetime.now(timezone.utc) - timedelta(days=day)
        # Add random but upward-trending records for each platform
        for platform in platforms:
            multiplier = 1.0 + (14 - day) * 0.08  # steady upward trend
            base_impressions = {
                "instagram": 1200,
                "facebook": 900,
                "linkedin": 600,
                "twitter": 400
            }[platform]
            
            impressions = int(base_impressions * multiplier * random.uniform(0.8, 1.2))
            reach = int(impressions * random.uniform(0.7, 0.85))
            likes = int(impressions * random.uniform(0.05, 0.09))
            comments = int(likes * random.uniform(0.1, 0.25))
            shares = int(likes * random.uniform(0.05, 0.15))
            clicks = int(reach * random.uniform(0.08, 0.15))
            
            eng_actions = likes + comments + shares + clicks
            engagement_rate = round((eng_actions / max(reach, 1)) * 100, 2)
            
            # Seed overall analytics record
            rec = AnalyticsRecord(
                user_id=user.id,
                campaign_id=summer_camp.id,
                platform=platform,
                impressions=impressions,
                reach=reach,
                likes=likes,
                comments=comments,
                shares=shares,
                clicks=clicks,
                engagement_rate=engagement_rate,
                metric_date=metric_date
            )
            db.add(rec)
    
    # Also add clearance campaign analytics
    for platform in ["facebook", "twitter"]:
        rec = AnalyticsRecord(
            user_id=user.id,
            campaign_id=clearance_camp.id,
            platform=platform,
            impressions=1500,
            reach=1200,
            likes=85,
            comments=15,
            shares=20,
            clicks=190,
            engagement_rate=14.5,
            metric_date=datetime.now(timezone.utc) - timedelta(days=48)
        )
        db.add(rec)
    
    db.commit()
    print("Seeded analytics records.")

    # 5. Seed Audience Segments
    segments = [
        AudienceSegment(
            user_id=user.id,
            name="Tech Enthusiasts (US/CA)",
            description="Highly active tech consumers, software engineers, and early adopters based in North America.",
            demographics={"locations": ["US", "CA"], "age_groups": ["21-35", "36-45"]},
            interests=["gadgets", "software", "artificial intelligence", "startups"],
            platform="linkedin",
            estimated_size=24500,
            is_active=True
        ),
        AudienceSegment(
            user_id=user.id,
            name="Digital Marketing Agency Leaders",
            description="Decision-makers at marketing agencies. Interested in scaling operations and social scheduling tools.",
            demographics={"locations": ["GB", "US", "AU"], "age_groups": ["30-55"]},
            interests=["social media marketing", "saas", "lead generation", "analytics"],
            platform="facebook",
            estimated_size=11200,
            is_active=True
        ),
        AudienceSegment(
            user_id=user.id,
            name="SMM Influencers & Creators",
            description="Instagram creators focused on lifestyle, entrepreneurship, and productivity tools.",
            demographics={"locations": ["US", "DE", "FR"], "age_groups": ["18-30"]},
            interests=["content creation", "branding", "video editing", "growth hacks"],
            platform="instagram",
            estimated_size=42800,
            is_active=True
        ),
        AudienceSegment(
            user_id=user.id,
            name="Deals & Discounts Hunters",
            description="Budget-conscious followers interested in software sales, discounts, and giveaway events.",
            demographics={"locations": ["IN", "US", "BR"], "age_groups": ["18-40"]},
            interests=["clearance sales", "discounts", "freebies", "productivity tools"],
            platform="twitter",
            estimated_size=63000,
            is_active=False
        )
    ]
    for s in segments:
        db.add(s)
    db.commit()
    print("Seeded audience segments successfully.")
