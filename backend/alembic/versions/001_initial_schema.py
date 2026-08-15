"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-04 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True, server_default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Posts table
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('media_urls', sa.JSON(), nullable=True),
        sa.Column('platforms', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED', name='poststatus'), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('recurrence_pattern', sa.Enum('DAILY', 'WEEKLY', 'MONTHLY', name='recurrencepattern'), nullable=True),
        sa.Column('recurrence_end_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_posts_id'), 'posts', ['id'], unique=False)

    # Scheduled Posts table
    op.create_table(
        'scheduled_posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='schedulestatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scheduled_posts_id'), 'scheduled_posts', ['id'], unique=False)
    op.create_index(op.f('ix_scheduled_posts_scheduled_time'), 'scheduled_posts', ['scheduled_time'], unique=False)

    # Publishing Queue table
    op.create_table(
        'publishing_queue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('scheduled_post_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('WAITING', 'PROCESSING', 'COMPLETED', 'FAILED', name='queuestatus'), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('max_retries', sa.Integer(), nullable=True, server_default='3'),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('scheduled_time', sa.DateTime(), nullable=False),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['scheduled_post_id'], ['scheduled_posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_publishing_queue_id'), 'publishing_queue', ['id'], unique=False)
    op.create_index(op.f('ix_publishing_queue_scheduled_time'), 'publishing_queue', ['scheduled_time'], unique=False)

def downgrade() -> None:
    op.drop_table('publishing_queue')
    op.drop_table('scheduled_posts')
    op.drop_table('posts')
    op.drop_table('users')
