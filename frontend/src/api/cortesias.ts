// Cortesias — UC06. Emissão de ingressos gratuitos por evento (organizador).

import { api } from "./client";

export type Cortesia = {
  id: string;
  evento_id: string;
  lote_id: string;
  beneficiado_id: string;
  emitida_por: string;
  ingresso_id: string | null;
  emitida_em: string;
  beneficiado_email: string;
  beneficiado_nome: string;
  lote_nome: string;
};

export type CortesiaCreate = {
  lote_id: string;
  email_beneficiado: string;
  motivo?: string | null;
};

export const listarCortesias = async (
  eventoId: string,
): Promise<Cortesia[]> => {
  const { data } = await api.get<Cortesia[]>(`/eventos/${eventoId}/cortesias`);
  return data;
};

export const emitirCortesia = async (
  eventoId: string,
  payload: CortesiaCreate,
): Promise<Cortesia> => {
  const { data } = await api.post<Cortesia>(
    `/eventos/${eventoId}/cortesias`,
    payload,
  );
  return data;
};

export const cancelarCortesia = async (cortesiaId: string): Promise<void> => {
  await api.delete(`/cortesias/${cortesiaId}`);
};
