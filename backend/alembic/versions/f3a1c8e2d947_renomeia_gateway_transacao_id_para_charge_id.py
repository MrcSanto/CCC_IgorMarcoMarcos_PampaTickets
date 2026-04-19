"""renomeia gateway_transacao_id para charge_id em pagamentos

Revision ID: f3a1c8e2d947
Revises: ac96aae550b4
Create Date: 2026-04-19

"""
from typing import Sequence, Union

from alembic import op


revision: str = "f3a1c8e2d947"
down_revision: Union[str, Sequence[str], None] = "ac96aae550b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("pagamentos", "gateway_transacao_id", new_column_name="charge_id")


def downgrade() -> None:
    op.alter_column("pagamentos", "charge_id", new_column_name="gateway_transacao_id")
