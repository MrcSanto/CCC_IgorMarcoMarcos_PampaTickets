// Formatadores em pt-BR — moeda, datas, helpers para datas laterais.
// Espelha PT_fmt do handoff (data.js) com tipagem.

const SEMANAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export const money = (v: number): string =>
  v === 0
    ? "Grátis"
    : "R$ " +
      Number(v).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export const moneyShort = (v: number): string =>
  v === 0
    ? "Grátis"
    : "R$ " + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const dateShort = (iso: string): string => {
  const d = new Date(iso);
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
};

export const dateLong = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatCpfCnpj = (raw: string): string => {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length === 14)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return raw;
};

export const formatCelular = (raw: string): string => {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
};

export type DateParts = {
  dia: string;
  mes: string;
  semana: string;
  ano: number;
  hora: string;
};

export const dateFull = (iso: string): DateParts => {
  const d = new Date(iso);
  return {
    dia: d.getDate().toString().padStart(2, "0"),
    mes: d
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
    semana: SEMANAS[d.getDay()],
    ano: d.getFullYear(),
    hora: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
