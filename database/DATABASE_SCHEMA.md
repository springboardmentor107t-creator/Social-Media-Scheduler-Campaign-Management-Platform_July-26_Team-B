# SocialPilot Database Schema

## Overview

The SocialPilot platform uses both PostgreSQL and MongoDB to manage application data.

- **PostgreSQL** — Stores structured relational application data.
- **MongoDB** — Stores flexible content and media metadata.
- **SQLAlchemy** — Used as the ORM for PostgreSQL.
- **Alembic** — Used for PostgreSQL database migrations.
- **PyMongo** — Used for MongoDB connectivity.

The database has been developed progressively across Milestone 1, Milestone 2, and Milestone 3.

---

# Database Architecture

SocialPilot uses two databases:

### PostgreSQL

PostgreSQL stores structured relational data such as:

- Users
- Roles
- User-role mappings
- Teams
- Team members
- Social platforms
- Social accounts
- Social account permissions
- Scheduled posts
- Publishing logs
- Campaigns
- Campaign platforms
- Campaign contents
- Campaign performance
- Audience growth

Database name:

```text
socialpilot_db
MongoDB

MongoDB stores flexible metadata for:

Social media content
Media files

Database name:

socialpilot_db

Collections:

content_metadata
media_metadata
Milestone 1 – User, Role, Social Account and Team Management
users

Stores registered users.

id — Primary Key
name
email — Unique
password_hash
bio
is_active
created_at
updated_at
roles

Stores Role-Based Access Control (RBAC) roles.

id — Primary Key
name — Unique

Default roles:

Content Creator
Marketing Team
Business User
Administrator
user_roles

Maps users to roles.

user_id — Foreign Key → users.id
role_id — Foreign Key → roles.id

Primary Key:

(user_id, role_id)

Relationship:

One user can have multiple roles.
One role can be assigned to multiple users.
social_platforms

Stores supported social media platforms.

id — Primary Key
name — Unique

Supported platforms include:

Facebook
Instagram
LinkedIn
X
YouTube
Pinterest
social_accounts

Stores social media accounts connected by users.

id — Primary Key
user_id — Foreign Key → users.id
platform_id — Foreign Key → social_platforms.id
platform_user_id
username
access_token
refresh_token
token_expires_at
is_active
last_synced_at
created_at
updated_at

Unique constraint:

(platform_id, platform_user_id)

Relationship:

One user can connect multiple social accounts.
One social platform can have multiple connected accounts.
social_account_permissions

Stores permissions granted to connected social accounts.

id — Primary Key
social_account_id — Foreign Key → social_accounts.id
permission_name
is_granted
created_at

Unique constraint:

(social_account_id, permission_name)
teams

Stores teams created within the SocialPilot system.

id — Primary Key
name
owner_id — Foreign Key → users.id
created_at

Relationship:

One user can own multiple teams.
Each team has one owner.
team_members

Maps users to teams.

team_id — Foreign Key → teams.id
user_id — Foreign Key → users.id
joined_at

Primary Key:

(team_id, user_id)

Relationship:

One team can have multiple members.
One user can belong to multiple teams.
Milestone 2 – Content Scheduling and Publishing
scheduled_posts

Stores social media posts created by users and scheduled for publishing.

id — Primary Key
user_id — Foreign Key → users.id
social_account_id — Foreign Key → social_accounts.id
title
content
scheduled_time
status
is_recurring
recurrence_pattern
created_at
updated_at

Possible status values:

Draft
Scheduled
Published
Failed

Relationships:

One user can create many scheduled posts.
One social account can have many scheduled posts.
publishing_logs

Stores the publishing history of scheduled posts.

id — Primary Key
scheduled_post_id — Foreign Key → scheduled_posts.id
published_at
status
platform_response
error_message
created_at

Possible status values:

Success
Failed

Relationship:

One scheduled post can have multiple publishing log entries.
Entity Relationship Diagram – Milestone 1 and Milestone 2
MongoDB

MongoDB is used for flexible data that does not require the same relational structure as PostgreSQL.

Database:

socialpilot_db
content_metadata

Stores flexible metadata associated with social media content.

Example fields:

user_id
title
content_type
platforms
status
tags
created_at
media_metadata

Stores metadata associated with media files.

Example fields:

user_id
file_name
media_type
file_size
storage_url
created_at
Milestone 3 – Campaign Management and Analytics

Milestone 3 extends the existing SocialPilot database to support campaign management, campaign-content relationships, campaign performance, engagement analytics, audience growth tracking, ROI analysis, and campaign reporting.

campaigns

Stores marketing campaigns created by users.

id — Primary Key
user_id — Foreign Key → users.id
name
start_date
end_date
budget
goal
status
created_at
updated_at

Relationship:

One user can create multiple campaigns.
Each campaign belongs to one user.
campaign_platforms

Maps campaigns to the social media platforms where they are executed.

id — Primary Key
campaign_id — Foreign Key → campaigns.id
platform_id — Foreign Key → social_platforms.id

Unique constraint:

(campaign_id, platform_id)

Relationship:

One campaign can use multiple social media platforms.
One social platform can be used by multiple campaigns.
campaign_contents

Links campaigns with scheduled social media posts.

id — Primary Key
campaign_id — Foreign Key → campaigns.id
scheduled_post_id — Foreign Key → scheduled_posts.id
created_at

Unique constraint:

(campaign_id, scheduled_post_id)

Relationship:

One campaign can contain multiple scheduled posts.
A scheduled post can be associated with a campaign.
campaign_performance

Stores campaign engagement and performance metrics.

id — Primary Key
campaign_id — Foreign Key → campaigns.id
platform_id — Foreign Key → social_platforms.id
spend
impressions
reach
likes
comments
shares
conversions
roi
recorded_at

Metrics include:

Impressions
Reach
Likes
Comments
Shares
Conversions
Spend
ROI

Relationship:

One campaign can have multiple performance records.
Performance can be recorded for individual social platforms.
audience_growth

Stores audience and follower growth associated with campaigns.

id — Primary Key
campaign_id — Foreign Key → campaigns.id
platform_id — Foreign Key → social_platforms.id
followers
recorded_at

Relationship:

One campaign can have multiple audience growth records.
Audience growth can be tracked separately for each social platform.
Milestone 3 – Entity Relationship Diagram
erDiagram

    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned

    USERS ||--o{ SOCIAL_ACCOUNTS : connects
    SOCIAL_PLATFORMS ||--o{ SOCIAL_ACCOUNTS : platform

    SOCIAL_ACCOUNTS ||--o{ SOCIAL_ACCOUNT_PERMISSIONS : has

    USERS ||--o{ TEAMS : owns
    USERS ||--o{ TEAM_MEMBERS : joins
    TEAMS ||--o{ TEAM_MEMBERS : contains

    USERS ||--o{ SCHEDULED_POSTS : creates
    SOCIAL_ACCOUNTS ||--o{ SCHEDULED_POSTS : publishes

    SCHEDULED_POSTS ||--o{ PUBLISHING_LOGS : generates

    USERS ||--o{ CAMPAIGNS : creates

    CAMPAIGNS ||--o{ CAMPAIGN_PLATFORMS : uses
    SOCIAL_PLATFORMS ||--o{ CAMPAIGN_PLATFORMS : supports

    CAMPAIGNS ||--o{ CAMPAIGN_CONTENTS : contains
    SCHEDULED_POSTS ||--o{ CAMPAIGN_CONTENTS : included

    CAMPAIGNS ||--o{ CAMPAIGN_PERFORMANCE : tracks
    SOCIAL_PLATFORMS ||--o{ CAMPAIGN_PERFORMANCE : measures

    CAMPAIGNS ||--o{ AUDIENCE_GROWTH : tracks
    SOCIAL_PLATFORMS ||--o{ AUDIENCE_GROWTH : measures
Milestone 3 – Database Relationships

The Milestone 3 database extends the existing SocialPilot workflow.

Users
  |
  └── Campaigns
        |
        ├── Campaign Platforms
        |       |
        |       └── Social Platforms
        |
        ├── Campaign Contents
        |       |
        |       └── Scheduled Posts
        |
        ├── Campaign Performance
        |       |
        |       └── Social Platforms
        |
        └── Audience Growth
                |
                └── Social Platforms
Complete Campaign Workflow

The database supports the following end-to-end workflow:

User
  ↓
Create Campaign
  ↓
Select Social Platforms
  ↓
Create / Schedule Content
  ↓
Publish Scheduled Posts
  ↓
Track Campaign Performance
  ↓
Track Engagement
  ↓
Track Audience Growth
  ↓
Calculate ROI
  ↓
Generate Campaign Reports
Milestone 3 Analytics Data

The database supports storage for:

Engagement analytics
Impressions
Reach
Likes
Comments
Shares
Conversions
Campaign spending
ROI metrics
Audience growth
Follower tracking
Platform-wise campaign performance
Campaign comparison
Campaign reporting
Sample Milestone 3 Data

Sample campaign and analytics data has been inserted into PostgreSQL for testing and verification.

Sample Campaign

Campaign:

MS3 Test Campaign

Budget:

5000

Goal:

Engagement

Status:

Active
Sample Campaign Platform

Campaign:

MS3 Test Campaign

Platform:

Instagram
Sample Campaign Content

Campaign:

MS3 Test Campaign

Scheduled Post:

Milestone 2 Demo Post
Sample Campaign Performance

Spend:

1200

Impressions:

15000

Reach:

10000

Likes:

850

Comments:

120

Shares:

75

Conversions:

45

ROI:

2.75
Sample Audience Growth

Platform:

Instagram

Followers:

12500
Database Migration

Alembic is used to manage PostgreSQL schema migrations.

The Milestone 3 migration adds the following tables:

campaigns
campaign_platforms
campaign_contents
campaign_performance
audience_growth

Migration status:

1ecee61dca88 (head)

The Milestone 3 migration was successfully applied to PostgreSQL.

Milestone 3 Database Status

Completed:

Campaign management schema created
Campaign-platform relationships configured
Campaign-content relationships configured
Campaign performance data storage implemented
Engagement metrics storage implemented
Audience growth data storage implemented
ROI data storage implemented
Sample campaign data inserted
Sample campaign-platform data inserted
Sample campaign-content data inserted
Sample performance data inserted
Sample audience growth data inserted
Alembic migration created
Database migration successfully applied
PostgreSQL schema verified
SQLAlchemy models verified
Campaign database insertion tested
Campaign analytics data insertion tested
Final Database Architecture

The SocialPilot database now supports the complete social media management and campaign analytics workflow.

PostgreSQL
│
├── User Management
│   ├── users
│   ├── roles
│   └── user_roles
│
├── Team Management
│   ├── teams
│   └── team_members
│
├── Social Account Management
│   ├── social_platforms
│   ├── social_accounts
│   └── social_account_permissions
│
├── Content Scheduling & Publishing
│   ├── scheduled_posts
│   └── publishing_logs
│
└── Campaign Management & Analytics
    ├── campaigns
    ├── campaign_platforms
    ├── campaign_contents
    ├── campaign_performance
    └── audience_growth


MongoDB
│
├── content_metadata
└── media_metadata
Technology Stack

The database layer uses:

PostgreSQL
MongoDB
SQLAlchemy
Alembic
PyMongo
Python
Milestone 3 Outcome

The SocialPilot database is now ready to support the workflow from:

Content Creation
       ↓
Content Scheduling
       ↓
Social Media Publishing
       ↓
Campaign Management
       ↓
Campaign Performance Tracking
       ↓
Engagement Analytics
       ↓
Audience Growth Tracking
       ↓
ROI Analysis
       ↓
Campaign Reporting

The database foundation now supports the SocialPilot workflow from content scheduling and publishing through campaign management, performance tracking, engagement analytics, audience growth, ROI analysis, and campaign reporting.