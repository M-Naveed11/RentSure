"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-07

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("google_id", sa.String(), nullable=True),
        sa.Column("plan", sa.Enum("FREE", "PREMIUM", name="userplan"), nullable=False, server_default="FREE"),
        sa.Column("stripe_customer_id", sa.String(), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(), nullable=True),
        sa.Column("analyses_this_month", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("chats_today", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_reset_date", sa.DateTime(), nullable=True),
        sa.Column("preferred_language", sa.String(), nullable=False, server_default="en"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True)

    # analyses
    op.create_table(
        "analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_name", sa.String(), nullable=False),
        sa.Column("file_url", sa.String(), nullable=True),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("property_type", sa.String(), nullable=True),
        sa.Column("emirate", sa.String(), nullable=True),
        sa.Column("area", sa.String(), nullable=True),
        sa.Column("annual_rent", sa.Float(), nullable=True),
        sa.Column("contract_start", sa.DateTime(), nullable=True),
        sa.Column("contract_end", sa.DateTime(), nullable=True),
        sa.Column("status", sa.Enum("PROCESSING", "COMPLETED", "FAILED", name="analysisstatus"), nullable=False, server_default="PROCESSING"),
        sa.Column("overall_score", sa.Integer(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("red_flags", postgresql.JSON(), nullable=True),
        sa.Column("yellow_flags", postgresql.JSON(), nullable=True),
        sa.Column("green_flags", postgresql.JSON(), nullable=True),
        sa.Column("fair_rent_min", sa.Float(), nullable=True),
        sa.Column("fair_rent_max", sa.Float(), nullable=True),
        sa.Column("rent_verdict", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_analyses_user_id", "analyses", ["user_id"])

    # chat_messages
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.Enum("USER", "ASSISTANT", name="messagerole"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("analysis_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_chat_messages_user_id", "chat_messages", ["user_id"])

    # generated_documents
    op.create_table(
        "generated_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("file_url", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("input_data", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_generated_documents_user_id", "generated_documents", ["user_id"])

    # rent_benchmarks
    op.create_table(
        "rent_benchmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("emirate", sa.String(), nullable=False),
        sa.Column("area", sa.String(), nullable=False),
        sa.Column("property_type", sa.String(), nullable=False),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("avg_rent", sa.Float(), nullable=False),
        sa.Column("min_rent", sa.Float(), nullable=False),
        sa.Column("max_rent", sa.Float(), nullable=False),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_rent_benchmarks_emirate", "rent_benchmarks", ["emirate"])
    op.create_index("ix_rent_benchmarks_area", "rent_benchmarks", ["area"])


def downgrade() -> None:
    op.drop_table("rent_benchmarks")
    op.drop_table("generated_documents")
    op.drop_table("chat_messages")
    op.drop_table("analyses")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userplan")
    op.execute("DROP TYPE IF EXISTS analysisstatus")
    op.execute("DROP TYPE IF EXISTS messagerole")
