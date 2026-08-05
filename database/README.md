# SocialPilot Backend – Database Setup

## Overview

This repository contains the Milestone 1 database setup for the SocialPilot project.

The database layer uses:

- PostgreSQL for structured relational data
- MongoDB for flexible content and media metadata
- SQLAlchemy as the PostgreSQL ORM
- Alembic for database migrations
- PyMongo for MongoDB connectivity

---

## Database Architecture

### PostgreSQL

PostgreSQL stores structured application data including:

- Users
- Roles
- User-role mappings
- Teams
- Team members
- Social platforms
- Social accounts
- Social account permissions

Database name:

```text
socialpilot_db
```

### MongoDB

MongoDB currently stores flexible metadata for:

- Social media content
- Media files

Database name:

```text
socialpilot_db
```

Collections:

```text
content_metadata
media_metadata
```

---

## Project Structure

```text
socialpilot-backend/
├── alembic/
│   └── versions/
├── .env
├── .env.example
├── .gitignore
├── alembic.ini
├── database.py
├── DATABASE_SCHEMA.md
├── models.py
├── mongodb.py
├── README.md
├── requirements.txt
└── test_models.py
```

Note: `.env` contains local credentials and must not be committed to Git.

---

## Requirements

Install the following software:

- Python 3
- PostgreSQL
- MongoDB Server
- MongoDB Shell (`mongosh`)

---

## Setup

### 1. Create a virtual environment

Windows:

```bat
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bat
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy:

```text
.env.example
```

to:

```text
.env
```

Configure the PostgreSQL password in `.env`.

Example:

```text
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/socialpilot_db
MONGODB_URL=mongodb://localhost:27017/
MONGODB_DATABASE=socialpilot_db
```

Do not commit the real `.env` file.

---

## PostgreSQL

The PostgreSQL database is:

```text
socialpilot_db
```

Main tables:

```text
users
roles
user_roles
social_platforms
social_accounts
social_account_permissions
teams
team_members
```

Detailed schema information and relationships are available in:

```text
DATABASE_SCHEMA.md
```

---

## SQLAlchemy

`database.py` configures the PostgreSQL connection and SQLAlchemy session.

Test the connection:

```bat
python database.py
```

Expected:

```text
PostgreSQL connected successfully!
```

Test ORM access:

```bat
python test_models.py
```

---

## Alembic Migrations

Alembic manages PostgreSQL schema migrations.

Check the current migration:

```bat
alembic current
```

Apply migrations:

```bat
alembic upgrade head
```

Rollback one migration:

```bat
alembic downgrade -1
```

Current Milestone 1 migration head:

```text
1a2b6503f504
```

---

## MongoDB

MongoDB uses:

```text
mongodb://localhost:27017/
```

Database:

```text
socialpilot_db
```

Collections:

```text
content_metadata
media_metadata
```

Test MongoDB connectivity:

```bat
python mongodb.py
```

Expected:

```text
MongoDB connected successfully!
Test document found:
Test Social Post
```

---

## Milestone 1 Database Status

Completed:

- PostgreSQL configured
- MongoDB configured
- User Management schema created
- Role-Based Access Control schema created
- Social Account Management schema created
- Team schema created
- SQLAlchemy ORM configured
- PostgreSQL connection tested
- Alembic configured
- Migration upgrade tested
- Migration downgrade tested
- PyMongo configured
- MongoDB connection tested
- Database schema documented

---

## Security Notes

- Never commit `.env`.
- Never store plain-text user passwords; store password hashes.
- OAuth access and refresh tokens are sensitive credentials and require secure handling.
- The current MongoDB setup is intended for local development. Authentication and appropriate access controls must be configured for production deployment.

---

## Milestone 1

The database foundation is ready for integration with the FastAPI backend.

Backend modules can use PostgreSQL for structured application data and MongoDB for flexible content/media metadata.