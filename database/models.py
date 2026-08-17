from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


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