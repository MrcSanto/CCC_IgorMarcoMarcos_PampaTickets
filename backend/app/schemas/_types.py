"""Tipos compartilhados entre schemas Pydantic."""

from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator


def _assumir_utc(valor: datetime) -> datetime:
    """
    Normaliza datetime para timezone-aware: se vier naive (sem tz), assume UTC.
    Usado em campos de input que são comparados contra colunas `timestamptz` do banco.
    """
    if valor.tzinfo is None:
        return valor.replace(tzinfo=timezone.utc)
    return valor


DatetimeUTC = Annotated[datetime, AfterValidator(_assumir_utc)]
