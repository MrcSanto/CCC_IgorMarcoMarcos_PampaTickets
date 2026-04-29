import json


class AsaasAPIError(Exception):
    """Erro de chamada ao Asaas — preserva status HTTP e corpo bruto da resposta."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Asaas {status_code}: {detail}")

    @property
    def user_message(self) -> str:
        """Extrai a descrição mais amigável dentre os erros devolvidos pelo Asaas.

        O formato esperado é `{"errors": [{"code": ..., "description": "..."}]}`.
        Se o corpo não for JSON ou não tiver o formato esperado, devolve o texto bruto.
        """
        try:
            data = json.loads(self.detail)
        except (json.JSONDecodeError, TypeError):
            return self.detail or "Erro desconhecido no gateway de pagamento."

        errors = data.get("errors") if isinstance(data, dict) else None
        if isinstance(errors, list):
            descriptions = [
                e.get("description")
                for e in errors
                if isinstance(e, dict) and e.get("description")
            ]
            if descriptions:
                return " · ".join(descriptions)

        return self.detail or "Erro desconhecido no gateway de pagamento."

    @property
    def is_client_error(self) -> bool:
        """True se Asaas rejeitou os dados (4xx) — input do usuário, não falha do gateway."""
        return 400 <= self.status_code < 500
