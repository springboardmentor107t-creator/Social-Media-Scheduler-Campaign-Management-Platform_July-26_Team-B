from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Numeric,
)
from sqlalchemy.sql import func

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now())
    bio = Column(Text, nullable=True)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
class SocialPlatform(Base):
    __tablename__ = "social_platforms"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)


class SocialAccount(Base):
    __tablename__ = "social_accounts"
    __table_args__ = (
    UniqueConstraint(
        "platform_id",
        "platform_user_id"
    ),
)

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    platform_id = Column(
        Integer,
        ForeignKey("social_platforms.id"),
        nullable=False,
    )

    platform_user_id = Column(String(255), nullable=False)
    username = Column(String(255))

    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime)

    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now())


class SocialAccountPermission(Base):
    __tablename__ = "social_account_permissions"
    __table_args__ = (
    UniqueConstraint(
        "social_account_id",
        "permission_name"
    ),
)

    id = Column(Integer, primary_key=True)

    social_account_id = Column(
        Integer,
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
    )

    permission_name = Column(String(100), nullable=False)
    is_granted = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(DateTime, server_default=func.now())


class TeamMember(Base):
    __tablename__ = "team_members"

    team_id = Column(
        Integer,
        ForeignKey("teams.id", ondelete="CASCADE"),
        primary_key=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    joined_at = Column(DateTime, server_default=func.now())
class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    social_account_id = Column(
        Integer,
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
    )

    title = Column(String(255), nullable=False)

    content = Column(Text, nullable=False)

    scheduled_time = Column(DateTime, nullable=False)

    status = Column(
        String(50),
        nullable=False,
        default="Scheduled"
    )

    is_recurring = Column(
        Boolean,
        default=False
    )

    recurrence_pattern = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )
class PublishingLog(Base):
    __tablename__ = "publishing_logs"

    id = Column(Integer, primary_key=True)

    scheduled_post_id = Column(
        Integer,
        ForeignKey(
            "scheduled_posts.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )

    published_at = Column(DateTime)

    status = Column(
        String(50),
        nullable=False,
    )

    platform_response = Column(Text)

    error_message = Column(Text)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String(255), nullable=False)

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    budget = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    goal = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
        default="Active",
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
    )


class CampaignPlatform(Base):
    __tablename__ = "campaign_platforms"

    id = Column(Integer, primary_key=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )

    platform_id = Column(
        Integer,
        ForeignKey("social_platforms.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "campaign_id",
            "platform_id",
        ),
    )


class CampaignContent(Base):
    __tablename__ = "campaign_contents"

    id = Column(Integer, primary_key=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )

    scheduled_post_id = Column(
        Integer,
        ForeignKey("scheduled_posts.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint(
            "campaign_id",
            "scheduled_post_id",
        ),
    )


class CampaignPerformance(Base):
    __tablename__ = "campaign_performance"

    id = Column(Integer, primary_key=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )

    platform_id = Column(
        Integer,
        ForeignKey("social_platforms.id", ondelete="CASCADE"),
        nullable=True,
    )

    spend = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    impressions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    reach = Column(
        Integer,
        nullable=False,
        default=0,
    )

    likes = Column(
        Integer,
        nullable=False,
        default=0,
    )

    comments = Column(
        Integer,
        nullable=False,
        default=0,
    )

    shares = Column(
        Integer,
        nullable=False,
        default=0,
    )

    conversions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    roi = Column(
        Numeric(8, 2),
        nullable=False,
        default=0,
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now(),
    )


class AudienceGrowth(Base):
    __tablename__ = "audience_growth"

    id = Column(Integer, primary_key=True)

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )

    platform_id = Column(
        Integer,
        ForeignKey("social_platforms.id", ondelete="CASCADE"),
        nullable=True,
    )

    followers = Column(
        Integer,
        nullable=False,
        default=0,
    )

    recorded_at = Column(
        DateTime,
        server_default=func.now(),
    )
