from typing import BinaryIO

from supabase import Client, create_client

from app.core.config import settings


def _to_bytes(file: BinaryIO | bytes) -> bytes:
    """
    Normaliza o conteúdo para bytes. O SDK `storage3` aceita bytes/BufferedReader,
    mas não BytesIO (que o ReportLab retorna).
    """
    if isinstance(file, (bytes, bytearray)):
        return bytes(file)
    if hasattr(file, "getvalue"):
        return file.getvalue()
    return file.read()


class SupabaseStorage:
    """Cliente para upload de arquivos no Supabase Storage."""

    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError(
                "SUPABASE_URL e SUPABASE_KEY são necessários para usar Supabase Storage"
            )

        self.client: Client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY,
        )

    async def upload_ingresso_pdf(
        self, file: BinaryIO, filename: str, ingresso_id: str
    ) -> str:
        """Faz upload de PDF de ingresso e retorna a URL pública."""
        bucket_name = settings.SUPABASE_BUCKET_INGRESSOS
        file_path = f"{ingresso_id}/{filename}"

        self.client.storage.from_(bucket_name).upload(
            path=file_path,
            file=_to_bytes(file),
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )

        return self.client.storage.from_(bucket_name).get_public_url(file_path)

    async def upload_certificado_pdf(
        self, file: BinaryIO, filename: str, ingresso_id: str
    ) -> str:
        """Faz upload de PDF de certificado e retorna a URL pública."""
        bucket_name = settings.SUPABASE_BUCKET_CERTIFICADOS
        file_path = f"{ingresso_id}/{filename}"

        self.client.storage.from_(bucket_name).upload(
            path=file_path,
            file=_to_bytes(file),
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )

        return self.client.storage.from_(bucket_name).get_public_url(file_path)

    async def upload_relatorio_pdf(
        self, file: BinaryIO, filename: str, evento_id: str
    ) -> str:
        """Faz upload de PDF de relatório e retorna a URL pública."""
        bucket_name = settings.SUPABASE_BUCKET_RELATORIOS
        file_path = f"{evento_id}/{filename}"

        self.client.storage.from_(bucket_name).upload(
            path=file_path,
            file=_to_bytes(file),
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )

        return self.client.storage.from_(bucket_name).get_public_url(file_path)


# Instância global (criada apenas se configurado)
supabase_storage = None
try:
    supabase_storage = SupabaseStorage()
except ValueError:
    # Supabase não configurado — funcionalidades degradam graciosamente
    pass
