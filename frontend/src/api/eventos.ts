// Endpoints públicos de eventos. Tenta a API real; se falhar (rede / 401),
// devolve os dados-mock de sample.ts para manter a UI navegável.

import { api } from "./client";
import { PT_EVENTS, type EventoSample } from "../data/sample";

export type EventoApi = {
  id: string;
  organizador_id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: string;
  criado_em: string;
};

const samplePalette = [
  "linear-gradient(135deg, #0d2b30 0%, #1f5a4a 60%, #c9a13b 100%)",
  "linear-gradient(135deg, #2a0a0a 0%, #7a1f1f 50%, #d4a437 100%)",
  "linear-gradient(135deg, #1a0a0a 0%, #c8102e 70%, #ffd700 100%)",
  "linear-gradient(135deg, #2a0a3e 0%, #ff5e3a 60%, #ffd700 100%)",
  "linear-gradient(135deg, #0a3d2e 0%, #1a8060 100%)",
];

const adapt = (e: EventoApi, idx: number): EventoSample => ({
  id: e.id,
  nome: e.nome,
  categoria: "Evento",
  data: e.data_inicio,
  dataFim: e.data_fim,
  cidade: e.local.split(",").slice(-1)[0]?.trim() ?? "—",
  estado: "RS",
  local: e.local,
  organizador: "—",
  descricao: e.descricao ?? "",
  img: samplePalette[idx % samplePalette.length],
  precoMin: 0,
  precoMax: 0,
  vendidos: 0,
  lotes: [],
  tags: [],
});

export const listarEventos = async (): Promise<EventoSample[]> => {
  try {
    const { data } = await api.get<EventoApi[]>("/eventos", {
      params: { limit: 50 },
    });
    if (!Array.isArray(data) || data.length === 0) return PT_EVENTS;
    return data.map(adapt);
  } catch {
    return PT_EVENTS;
  }
};

export const obterEvento = async (id: string): Promise<EventoSample> => {
  const local = PT_EVENTS.find((e) => e.id === id);
  try {
    const { data } = await api.get<EventoApi>(`/eventos/${id}`);
    const adapted = adapt(data, 0);
    return local ? { ...adapted, lotes: local.lotes, img: local.img } : adapted;
  } catch {
    return local ?? PT_EVENTS[0];
  }
};
