// Cupons — UC05. Gestão de cupons de desconto por evento (organizador).

import { api } from "./client";

export type TipoDesconto = "PERCENTUAL" | "VALOR_FIXO";

export type Cupom = {
  id: string;
  evento_id: string;
  codigo: string;
  tipo_desconto: TipoDesconto;
  valor_desconto: number;
  quantidade_maxima: number | null;
  quantidade_usada: number;
  quantidade_disponivel: number | null;
  valido_ate: string;
  ativo: boolean;
  criado_em: string;
};

export type CupomCreate = {
  codigo: string;
  tipo_desconto: TipoDesconto;
  valor_desconto: number;
  quantidade_maxima?: number | null;
  valido_ate: string;
  ativo?: boolean;
};

export type CupomUpdate = Partial<{
  tipo_desconto: TipoDesconto;
  valor_desconto: number;
  quantidade_maxima: number | null;
  valido_ate: string;
  ativo: boolean;
}>;

// Resultado da validação pública de um cupom (UC07 — fluxo de compra do participante).
export type CupomValidacao = {
  cupom_id: string;
  codigo: string;
  tipo_desconto: TipoDesconto;
  valor_desconto_aplicado: number;
  valor_final: number;
};

// Valida o cupom para o evento e calcula o desconto sobre `valorBase` (subtotal).
// Não persiste nada — o desconto só é efetivado quando o pedido é criado.
export const validarCupom = async (
  eventoId: string,
  codigo: string,
  valorBase: number,
): Promise<CupomValidacao> => {
  const { data } = await api.post<CupomValidacao>(
    `/eventos/${eventoId}/cupons/validar`,
    { codigo, valor_base: valorBase },
  );
  return data;
};

export const listarCupons = async (eventoId: string): Promise<Cupom[]> => {
  const { data } = await api.get<Cupom[]>(`/eventos/${eventoId}/cupons`);
  return data;
};

export const criarCupom = async (
  eventoId: string,
  payload: CupomCreate,
): Promise<Cupom> => {
  const { data } = await api.post<Cupom>(`/eventos/${eventoId}/cupons`, payload);
  return data;
};

export const editarCupom = async (
  cupomId: string,
  payload: CupomUpdate,
): Promise<Cupom> => {
  const { data } = await api.put<Cupom>(`/cupons/${cupomId}`, payload);
  return data;
};

export const deletarCupom = async (cupomId: string): Promise<void> => {
  await api.delete(`/cupons/${cupomId}`);
};
