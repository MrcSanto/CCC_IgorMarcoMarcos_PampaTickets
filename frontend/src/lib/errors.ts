// Extrai uma mensagem útil de erros vindos do axios.
// FastAPI manda `detail` como string para HTTPException
// e como array `[{loc, msg, type}, ...]` para erros de validação Pydantic.

import { AxiosError } from "axios";

type FastApiViolation = { loc?: (string | number)[]; msg?: string };

const isViolation = (v: unknown): v is FastApiViolation =>
  typeof v === "object" && v !== null && "msg" in v;

// Pydantic prefixa erros de @field_validator com "Value error, " — esconde do usuário.
const stripPydanticPrefix = (msg: string): string =>
  msg.replace(/^Value error,\s*/i, "");

export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    if (!err.response) {
      return "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
    }
    const detail = (err.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail.find(isViolation);
      if (first?.msg) return stripPydanticPrefix(first.msg);
    }
  }
  return fallback;
};
