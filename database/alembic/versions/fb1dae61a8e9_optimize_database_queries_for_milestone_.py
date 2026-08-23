"""optimize database queries for milestone 4

Revision ID: fb1dae61a8e9
Revises: 1ecee61dca88
Create Date: 2026-08-23

"""

from typing import Sequence, Union

from alembic import op


# Revision identifiers, used by Alembic.
revision: str = "fb1dae61a8e9"
down_revision: Union[str, Sequence[str], None] = "1ecee61dca88"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add indexes to improve frequently used database queries."""

    # Campaign listing:
    # WHERE user_id = ?
    # AND status = ?
    # ORDER BY created_at DESC
    op.create_index(
        "ix_campaigns_user_status_created",
        "campaigns",
        ["user_id", "status", "created_at"],
    )

    # Campaign content lookup:
    # WHERE campaign_id = ?
    op.create_index(
        "ix_campaign_contents_campaign_id",
        "campaign_contents",
        ["campaign_id"],
    )

    # Campaign performance:
    # WHERE campaign_id = ?
    # AND platform_id = ?
    # ORDER BY recorded_at DESC
    op.create_index(
        "ix_campaign_performance_campaign_platform_date",
        "campaign_performance",
        ["campaign_id", "platform_id", "recorded_at"],
    )

    # Audience growth:
    # WHERE campaign_id = ?
    # AND platform_id = ?
    # ORDER BY recorded_at DESC
    op.create_index(
        "ix_audience_growth_campaign_platform_date",
        "audience_growth",
        ["campaign_id", "platform_id", "recorded_at"],
    )


def downgrade() -> None:
    """Remove the Milestone 4 performance indexes."""

    op.drop_index(
        "ix_audience_growth_campaign_platform_date",
        table_name="audience_growth",
    )

    op.drop_index(
        "ix_campaign_performance_campaign_platform_date",
        table_name="campaign_performance",
    )

    op.drop_index(
        "ix_campaign_contents_campaign_id",
        table_name="campaign_contents",
    )

    op.drop_index(
        "ix_campaigns_user_status_created",
        table_name="campaigns",
    )