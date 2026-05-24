"""Utilitários para manipulação de datetime."""

from datetime import datetime, timezone


def aware_utc(dt: datetime) -> datetime:
    """
    Garante que o datetime é timezone-aware (UTC). Se vier naive, assume UTC.

    Use sempre que for comparar datetimes nos services para defender contra
    valores naive que podem aparecer por: dados legados pré-migração tz-aware,
    inputs do frontend sem timezone, ou retornos inesperados do driver.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt
