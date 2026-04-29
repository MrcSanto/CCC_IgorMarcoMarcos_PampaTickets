// Dados de exemplo derivados do handoff (data.js).
// Usados como fallback quando a API não responde — mantém a UI navegável
// mesmo offline, útil para a apresentação acadêmica.

export type LoteSample = {
  nome: string;
  tipo: "INTEIRA" | "MEIA" | "PROMOCIONAL";
  preco: number;
  restantes: number;
  total: number;
};

export type EventoSample = {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  dataFim?: string;
  cidade: string;
  estado: string;
  local: string;
  organizador: string;
  descricao: string;
  img: string;
  precoMin: number;
  precoMax: number;
  vendidos: number;
  lotes: LoteSample[];
  tags: string[];
  destaque?: boolean;
  urgente?: boolean;
};

export const PT_EVENTS: EventoSample[] = [
  {
    id: "e1",
    nome: "Festival de Inverno de Gramado",
    categoria: "Festival",
    data: "2026-07-18T20:00:00",
    dataFim: "2026-07-20T23:59:00",
    cidade: "Gramado",
    estado: "RS",
    local: "Centro de Eventos Serra Park",
    organizador: "Serra Eventos",
    descricao:
      "Três dias de música, gastronomia e cinema nas montanhas gaúchas. Atrações nacionais e internacionais.",
    img: "linear-gradient(135deg, #0d2b30 0%, #1f5a4a 60%, #c9a13b 100%)",
    precoMin: 89,
    precoMax: 480,
    vendidos: 0.74,
    lotes: [
      { nome: "1º lote · Inteira", tipo: "INTEIRA", preco: 280, restantes: 12, total: 500 },
      { nome: "1º lote · Meia", tipo: "MEIA", preco: 140, restantes: 0, total: 200 },
      { nome: "2º lote · Inteira", tipo: "INTEIRA", preco: 380, restantes: 187, total: 500 },
      { nome: "VIP Camarote", tipo: "PROMOCIONAL", preco: 480, restantes: 32, total: 80 },
    ],
    tags: ["Música", "Gastronomia", "Cinema"],
    destaque: true,
  },
  {
    id: "e2",
    nome: "Acampamento Farroupilha 2026",
    categoria: "Cultural",
    data: "2026-09-12T09:00:00",
    dataFim: "2026-09-20T23:00:00",
    cidade: "Porto Alegre",
    estado: "RS",
    local: "Parque da Harmonia",
    organizador: "CTG Coletivo",
    descricao:
      "A maior celebração da cultura gaúcha. Piquetes, danças, gastronomia tradicional e shows.",
    img: "linear-gradient(135deg, #2a0a0a 0%, #7a1f1f 50%, #d4a437 100%)",
    precoMin: 0,
    precoMax: 120,
    vendidos: 0.42,
    lotes: [
      { nome: "Entrada Geral", tipo: "INTEIRA", preco: 25, restantes: 4203, total: 8000 },
      { nome: "Estudante", tipo: "MEIA", preco: 12.5, restantes: 1102, total: 2000 },
      { nome: "Combo Família (4 pessoas)", tipo: "PROMOCIONAL", preco: 80, restantes: 312, total: 500 },
    ],
    tags: ["Tradição", "Gaúcho", "Família"],
    destaque: true,
  },
  {
    id: "e3",
    nome: "Grenal · Beira-Rio",
    categoria: "Esporte",
    data: "2026-05-10T16:00:00",
    dataFim: "2026-05-10T18:00:00",
    cidade: "Porto Alegre",
    estado: "RS",
    local: "Estádio Beira-Rio",
    organizador: "SC Internacional",
    descricao:
      "O clássico do sul. Internacional vs Grêmio pelo Campeonato Brasileiro.",
    img: "linear-gradient(135deg, #1a0a0a 0%, #c8102e 70%, #ffd700 100%)",
    precoMin: 60,
    precoMax: 800,
    vendidos: 0.91,
    lotes: [
      { nome: "Arquibancada Norte", tipo: "INTEIRA", preco: 120, restantes: 0, total: 8000 },
      { nome: "Arquibancada Sul", tipo: "INTEIRA", preco: 120, restantes: 423, total: 8000 },
      { nome: "Cadeira Coberta", tipo: "INTEIRA", preco: 280, restantes: 89, total: 2000 },
      { nome: "Camarote Premium", tipo: "PROMOCIONAL", preco: 800, restantes: 12, total: 60 },
    ],
    tags: ["Futebol", "Clássico"],
    destaque: true,
    urgente: true,
  },
  {
    id: "e4",
    nome: "Planeta Atlântida 2027",
    categoria: "Festival",
    data: "2027-01-29T18:00:00",
    dataFim: "2027-01-30T06:00:00",
    cidade: "Atlântida",
    estado: "RS",
    local: "SABA",
    organizador: "Atlântida Produções",
    descricao: "O maior festival do sul. Dois dias de música com line-up internacional.",
    img: "linear-gradient(135deg, #2a0a3e 0%, #ff5e3a 60%, #ffd700 100%)",
    precoMin: 320,
    precoMax: 1200,
    vendidos: 0.58,
    lotes: [
      { nome: "Pista · 1º lote", tipo: "INTEIRA", preco: 380, restantes: 0, total: 5000 },
      { nome: "Pista · 2º lote", tipo: "INTEIRA", preco: 460, restantes: 1842, total: 5000 },
      { nome: "Pista Premium", tipo: "PROMOCIONAL", preco: 720, restantes: 312, total: 1500 },
      { nome: "Camarote Open Bar", tipo: "PROMOCIONAL", preco: 1200, restantes: 48, total: 200 },
    ],
    tags: ["Música", "Verão", "Internacional"],
    destaque: true,
  },
  {
    id: "e5",
    nome: "Stand-Up · Fábio Porchat",
    categoria: "Comédia",
    data: "2026-06-05T21:00:00",
    cidade: "Caxias do Sul",
    estado: "RS",
    local: "Teatro da UCS",
    organizador: "Risadaria",
    descricao: "Novo show solo. Ingressos limitados.",
    img: "linear-gradient(135deg, #0a3d2e 0%, #1a8060 100%)",
    precoMin: 80,
    precoMax: 180,
    vendidos: 0.88,
    lotes: [
      { nome: "Plateia A", tipo: "INTEIRA", preco: 180, restantes: 8, total: 200 },
      { nome: "Plateia B", tipo: "INTEIRA", preco: 120, restantes: 42, total: 400 },
      { nome: "Estudante", tipo: "MEIA", preco: 60, restantes: 22, total: 100 },
    ],
    tags: ["Stand-up", "Teatro"],
    urgente: true,
  },
  {
    id: "e6",
    nome: "Expointer 2026",
    categoria: "Feira",
    data: "2026-08-28T08:00:00",
    dataFim: "2026-09-06T20:00:00",
    cidade: "Esteio",
    estado: "RS",
    local: "Parque de Exposições Assis Brasil",
    organizador: "Governo do RS",
    descricao: "A maior feira agropecuária da América Latina. 9 dias de exposição.",
    img: "linear-gradient(135deg, #1a3a1a 0%, #5a8040 60%, #d4a437 100%)",
    precoMin: 20,
    precoMax: 80,
    vendidos: 0.31,
    lotes: [
      { nome: "Diária", tipo: "INTEIRA", preco: 40, restantes: 24000, total: 30000 },
      { nome: "Diária Estudante", tipo: "MEIA", preco: 20, restantes: 8000, total: 10000 },
      { nome: "Passe 9 dias", tipo: "PROMOCIONAL", preco: 240, restantes: 1200, total: 2000 },
    ],
    tags: ["Agro", "Rural", "Família"],
  },
  {
    id: "e7",
    nome: "Bienal do Mercosul · 14ª edição",
    categoria: "Arte",
    data: "2026-09-05T10:00:00",
    dataFim: "2026-12-10T18:00:00",
    cidade: "Porto Alegre",
    estado: "RS",
    local: "MARGS · Cais Embarcadero",
    organizador: "Fundação Bienal",
    descricao:
      "Arte contemporânea da América Latina e além. Entrada gratuita em alguns dias.",
    img: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #e94560 100%)",
    precoMin: 0,
    precoMax: 30,
    vendidos: 0.12,
    lotes: [
      { nome: "Entrada Geral", tipo: "INTEIRA", preco: 30, restantes: 8800, total: 10000 },
      { nome: "Estudante / Idoso", tipo: "MEIA", preco: 15, restantes: 4200, total: 5000 },
    ],
    tags: ["Arte", "Cultura"],
  },
  {
    id: "e8",
    nome: "Lollapalooza Pampa Sessions",
    categoria: "Festival",
    data: "2026-11-14T15:00:00",
    cidade: "Porto Alegre",
    estado: "RS",
    local: "Anfiteatro Pôr-do-Sol",
    organizador: "T4F",
    descricao: "Edição especial sul. Line-up indie/alternativo internacional.",
    img: "linear-gradient(135deg, #1a0a2e 0%, #7c3aed 60%, #ec4899 100%)",
    precoMin: 240,
    precoMax: 620,
    vendidos: 0.66,
    lotes: [
      { nome: "Pista", tipo: "INTEIRA", preco: 280, restantes: 1200, total: 4000 },
      { nome: "Front Stage", tipo: "PROMOCIONAL", preco: 620, restantes: 142, total: 800 },
    ],
    tags: ["Indie", "Alternativo"],
  },
];

export const PT_CATEGORIES = [
  { id: "shows", label: "Shows", icon: "♪" },
  { id: "festivais", label: "Festivais", icon: "✦" },
  { id: "esportes", label: "Esportes", icon: "⚽" },
  { id: "teatro", label: "Teatro", icon: "◐" },
  { id: "comedia", label: "Comédia", icon: "☺" },
  { id: "arte", label: "Arte", icon: "◆" },
  { id: "feira", label: "Feiras", icon: "⌂" },
  { id: "cultural", label: "Cultural", icon: "✿" },
];

export const PT_CITIES = [
  "Porto Alegre",
  "Gramado",
  "Caxias do Sul",
  "Pelotas",
  "Santa Maria",
  "Esteio",
  "Atlântida",
  "Canoas",
];

export const PT_ORG_DATA = {
  evento: "Festival de Inverno de Gramado",
  vendas7d: [
    { dia: "Seg", valor: 12400 },
    { dia: "Ter", valor: 18200 },
    { dia: "Qua", valor: 15800 },
    { dia: "Qui", valor: 22100 },
    { dia: "Sex", valor: 38400 },
    { dia: "Sáb", valor: 41200 },
    { dia: "Dom", valor: 28900 },
  ],
  metricas: {
    receita: 487320,
    receitaDelta: 0.124,
    ingressos: 1842,
    ingressosDelta: 0.087,
    conversao: 0.043,
    conversaoDelta: -0.012,
    ticketMedio: 264.5,
    ticketMedioDelta: 0.034,
  },
  pedidosRecentes: [
    { id: "#PT-48291", participante: "Maria S.", valor: 380, status: "PAGO", metodo: "PIX", minutos: 2 },
    { id: "#PT-48290", participante: "João M.", valor: 760, status: "PAGO", metodo: "CRÉDITO", minutos: 4 },
    { id: "#PT-48289", participante: "Ana L.", valor: 280, status: "PENDENTE", metodo: "PIX", minutos: 7 },
    { id: "#PT-48288", participante: "Pedro R.", valor: 480, status: "PAGO", metodo: "PIX", minutos: 11 },
    { id: "#PT-48287", participante: "Carla F.", valor: 380, status: "CANCELADO", metodo: "BOLETO", minutos: 14 },
    { id: "#PT-48286", participante: "Lucas O.", valor: 1140, status: "PAGO", metodo: "CRÉDITO", minutos: 18 },
  ],
};
