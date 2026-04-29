"""Validações de domínio reutilizáveis (CPF/CNPJ, etc.)."""

import re

# Pesos do algoritmo Mod 11 da Receita Federal.
_CNPJ_WEIGHTS_DV1 = (5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
_CNPJ_WEIGHTS_DV2 = (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)


def _strip_non_digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def _mod11_check_digit(digits: str, weights: tuple[int, ...]) -> str:
    total = sum(int(d) * w for d, w in zip(digits, weights))
    rest = total % 11
    return "0" if rest < 2 else str(11 - rest)


def _is_repeated(digits: str) -> bool:
    return len(set(digits)) == 1


def validar_cpf(cpf: str) -> str:
    """Valida CPF pelo algoritmo Mod 11 da Receita Federal.

    Aceita string com ou sem máscara. Devolve a string normalizada
    (apenas dígitos) ou levanta `ValueError` com mensagem em PT-BR.
    """
    digitos = _strip_non_digits(cpf)
    if len(digitos) != 11:
        raise ValueError("CPF deve conter 11 dígitos.")
    if _is_repeated(digitos):
        raise ValueError("CPF inválido.")

    dv1 = _mod11_check_digit(digitos[:9], tuple(range(10, 1, -1)))
    dv2 = _mod11_check_digit(digitos[:10], tuple(range(11, 1, -1)))
    if digitos[9] != dv1 or digitos[10] != dv2:
        raise ValueError("CPF inválido.")

    return digitos


def validar_cnpj(cnpj: str) -> str:
    """Valida CNPJ pelo algoritmo Mod 11 da Receita Federal.

    Aceita string com ou sem máscara. Devolve a string normalizada
    (apenas dígitos) ou levanta `ValueError` com mensagem em PT-BR.
    """
    digitos = _strip_non_digits(cnpj)
    if len(digitos) != 14:
        raise ValueError("CNPJ deve conter 14 dígitos.")
    if _is_repeated(digitos):
        raise ValueError("CNPJ inválido.")

    dv1 = _mod11_check_digit(digitos[:12], _CNPJ_WEIGHTS_DV1)
    dv2 = _mod11_check_digit(digitos[:13], _CNPJ_WEIGHTS_DV2)
    if digitos[12] != dv1 or digitos[13] != dv2:
        raise ValueError("CNPJ inválido.")

    return digitos


def validar_cpf_cnpj(valor: str) -> str:
    """Decide entre CPF (11 dígitos) e CNPJ (14 dígitos) e valida.

    Aceita string com ou sem máscara. Devolve a string normalizada
    (apenas dígitos) ou levanta `ValueError` com mensagem em PT-BR.
    """
    digitos = _strip_non_digits(valor)
    if len(digitos) == 11:
        return validar_cpf(digitos)
    if len(digitos) == 14:
        return validar_cnpj(digitos)
    raise ValueError("CPF/CNPJ inválido. Informe 11 dígitos para CPF ou 14 para CNPJ.")
