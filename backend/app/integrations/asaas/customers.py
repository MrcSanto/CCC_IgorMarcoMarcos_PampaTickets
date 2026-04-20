from uuid import UUID

from app.integrations.asaas.client import get_client
from app.integrations.asaas.exceptions import AsaasAPIError


async def create_customer(
    *,
    nome: str,
    cpf_cnpj: str,
    email: str,
    celular: str,
    usuario_id: UUID,
) -> dict:
    payload = {
        "name": nome,
        "cpfCnpj": cpf_cnpj,
        "email": email,
        "mobilePhone": celular,
        "externalReference": str(usuario_id),
    }
    response = await get_client().post("/customers", json=payload)
    if response.is_error:
        raise AsaasAPIError(response.status_code, response.text)
    return response.json()


async def get_customer(customer_id: str) -> dict:
    resp = await get_client().get(f"/customers/{customer_id}")
    if resp.is_error:
        raise AsaasAPIError(resp.status_code, resp.text)
    return resp.json()
