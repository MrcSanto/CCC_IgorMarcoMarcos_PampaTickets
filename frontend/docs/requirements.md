# requirements.md — Regras de Arquitetura e Padrões de UI

Documento de referência para decisões arquiteturais do frontend. Toda contribuição deve seguir estas regras.

---

## Camadas da aplicação

| Camada | Responsabilidade | Nunca pode |
|---|---|---|
| `pages/` | Componentes de tela. Buscam dados via `api/`, montam o layout, delegam pedaços para `components/`. | Conter `axios` direto, lógica de formatação solta ou estilos inline complexos. |
| `layouts/` | Cascas (header/sidebar/footer) compartilhadas entre rotas da mesma persona. | Conter regra de negócio ou chamada HTTP. |
| `components/` | Blocos visuais reutilizáveis entre páginas (cards, pílulas, barras, headers). | Conhecer rotas específicas ou fazer chamadas HTTP. |
| `api/` | **Toda** comunicação com o backend FastAPI. Funções tipadas que retornam DTOs. | Conter JSX, hooks React ou ler diretamente do `localStorage` (exceto o cliente para o JWT). |
| `lib/` | Utilitários puros — formatação (`format.ts`), erros (`errors.ts`), store de auth (`auth-store.ts`), hidratação do evento por id de rota (`active-event.ts` → `useEvento`). | Conter JSX (exceto hooks customizados quando necessário). |

**Dependência unidirecional:** `pages → {components, api, lib}` e `api → lib`. Componentes nunca importam de páginas; `lib/` nunca importa de `api/`.

---

## Camada `api/` — comunicação com o backend

### Regras

1. **Apenas `api/` importa `axios`.** Se uma página precisar, é sinal de que falta função em `api/`.
2. **Cliente único** em [`api/client.ts`](../src/api/client.ts) — `baseURL` lido de `import.meta.env.VITE_API_URL` (default `http://localhost:8000/api`).
3. **Interceptor de JWT**: o token vive em `localStorage` sob a chave `pt_token` e é injetado automaticamente no header `Authorization`.
4. **Tipos por endpoint**: cada arquivo de `api/` exporta os tipos dos DTOs que recebe/envia (ex: `Usuario`, `LoginPayload`, `EventoApi`). Não reaproveitar tipos de domínio do backend — duplicar é melhor que acoplar.
5. **Erros do backend**: capturar `AxiosError` e tratar via [`lib/errors.ts`](../src/lib/errors.ts) (`extractErrorMessage`), que entende o formato `detail` do FastAPI (string ou lista de violações Pydantic).
6. **Sem fallback para mocks**: se a API falhar, a tela mostra mensagem de erro (`extractErrorMessage`) ou um estado vazio explícito. Nada de dados-mock — o frontend sempre reflete o estado real do backend.
7. **Logout** sempre via `api/auth.logout()` — limpa token e usuário ao mesmo tempo.
8. **Imagens de evento**: o backend não armazena imagem. Use `gradientFor(id)` de `api/eventos.ts` para um gradient determinístico (mesmo id → mesma cor). Quando houver upload no backend, trocar pelo `imagem_url`.

### Exemplo de uso

```ts
// pages/auth/LoginPage.tsx
import { login } from "../../api/auth";
import { extractErrorMessage } from "../../lib/errors";

const onSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    const usuario = await login({ email, senha });
    navigate(usuario.perfil === "ORGANIZADOR" ? "/organizador" : "/inicio");
  } catch (err) {
    setErro(extractErrorMessage(err, "Falha ao entrar."));
  }
};
```

---

## Estado de autenticação

- Não há Context Provider global. O usuário logado vive em `localStorage` (`pt_user`) e é lido pelo hook `useCurrentUser()` em [`lib/auth-store.ts`](../src/lib/auth-store.ts).
- Atualizações disparam um `CustomEvent` (`pt-auth-change`) na `window`, e o hook escuta também o evento `storage` nativo (para sincronizar entre abas).
- **Por que não Context**: o app é pequeno, só precisamos saber "tem alguém logado?" em poucos pontos, e queremos evitar re-renders em cascata. Se a complexidade crescer, migrar para Context ou Zustand é trivial.

---

## Padrões de UI

### Tema por persona

- **Vitrine + Participante** (rotas flat: `/inicio`, `/eventos`, `/meus-ingressos`, …): tema **escuro**, foco em descoberta. Layout via `layouts/ParticipantLayout.tsx` — também envolve as rotas públicas de vitrine, já que o layout suporta o estado deslogado (mostra "Entrar" no topo).
- **Organizador** (prefixo `/organizador`): tema **claro**, foco em dashboards e formulários. Layout via `layouts/OrganizerLayout.tsx`.
- **Auth** (`/login`, `/cadastro`): casca neutra via `pages/auth/AuthShell.tsx`.

### Estilos

1. **CSS Modules** (`*.module.css`) por componente/página. Cada `Foo.tsx` tem um `Foo.module.css` ao lado.
2. **Sem CSS global** fora de `src/index.css` (reset + variáveis CSS — cores, espaçamentos, tipografia).
3. **Sem libs de UI** (MUI, Chakra etc.). Mantemos o controle total do visual para a identidade regional do projeto.
4. **Variáveis CSS** em `:root` para cores e tokens compartilhados — referenciar via `var(--cor-primaria)`, não hard-code.

### Formatação e datas

Toda formatação centralizada em [`lib/format.ts`](../src/lib/format.ts):

- Moeda: `money(v)` → `"R$ 120,00"` ou `"Grátis"` quando zero.
- Datas curtas: `dateShort(iso)` → `"15 dez"`.
- Datas longas: `dateLong(iso)` → `"15 de dezembro de 2026"`.
- Bloco de data (`DateBlock` component): `dateFull(iso)` → `{dia, mes, semana, ano, hora}`.
- CPF/CNPJ: `formatCpfCnpj(raw)`.
- Celular: `formatCelular(raw)` → `"(54) 99999-9999"`.

**Datetimes** vindos da API são strings ISO. O backend opera em UTC tz-aware; o frontend exibe em horário local do navegador via `toLocaleDateString("pt-BR", ...)`.

---

## Convenções de código

- **Idioma:** comentários e textos voltados ao usuário em **português**. Nomenclatura técnica (componentes, hooks, variáveis) em **inglês** (`EventCard`, `useCurrentUser`, `extractErrorMessage`).
- **Componentes** como `const Foo = () => (...)` exportados nomeadamente (`export const Foo`). Sem `export default` — facilita refator e renomeação.
- **Imports** ordenados: libs externas → módulos absolutos do projeto → relativos. Tipos importados com `import type` quando o `verbatimModuleSyntax` exigir.
- **Commits** em português: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- **Pacotes:** sempre `npm install <pacote>` dentro do container — nunca editar `package.json` à mão.
- **Lint:** `npm run lint` deve passar sem warnings antes de commitar. Regras-chave: `noUnusedLocals`, `noUnusedParameters`, `react-hooks/rules-of-hooks`.

---

## Rotas

Mapa completo em [`src/App.tsx`](../src/App.tsx). Convenção: **rotas flat** estilo Ticketmaster — sem prefixo para vitrine e participante, prefixo `/organizador` só onde faz sentido separar a área de gestão.

### Públicas (sem layout de persona)

| Rota | Tela |
|---|---|
| `/` | `LandingPage` |
| `/login` | `LoginPage` |
| `/cadastro` | `CadastroPage` |

### Vitrine + Participante (`ParticipantLayout` — tema escuro)

| Rota | Tela | Pública? |
|---|---|---|
| `/inicio` | `HomePage` (vitrine pós-login com destaques) | autenticado |
| `/eventos` | `SearchPage` (catálogo / busca) | sim |
| `/eventos/:id` | `EventoPage` (detalhe) | sim |
| `/eventos/:id/checkout` | `CheckoutPage` (UC07) | autenticado |
| `/eventos/:id/ingressos` | `TicketsPage` (confirmação pós-compra) | autenticado |
| `/meus-ingressos` | `MyTicketsPage` | autenticado |

### Organizador (`OrganizerLayout` — tema claro, prefixo `/organizador`)

| Rota | Tela |
|---|---|
| `/organizador` | `DashboardPage` (lista de eventos) |
| `/organizador/eventos/novo` | `CreateEventPage` (UC02) |
| `/organizador/eventos/:id` | `OrgEventoPage` (overview do evento + métricas UC14) |
| `/organizador/eventos/:id/lotes` | `LotesPage` (UC03 — lista + criação) |
| `/organizador/eventos/:id/cupons` | `CuponsPage` (UC05) |
| `/organizador/eventos/:id/cortesias` | `CortesiasPage` (UC06) |
| `/organizador/eventos/:id/checkin` | `CheckinPage` (UC04) |
| `/organizador/eventos/:id/participantes` | `AttendeesPage` (ingressos vendidos do evento) |
| `/organizador/eventos/:id/financeiro` | `FinancePage` (UC14 — baixa o PDF) |
| `*` | Redirect para `/` |

### Notas

- Hoje **não há guard de rota** — qualquer um navega para `/inicio`, `/meus-ingressos` ou `/organizador/*`. O backend é a fonte de verdade (rejeita request sem JWT). Adicionar guard é um TODO listado em `state.md`.
- A escolha de redirecionamento pós-login usa `usuario.perfil` retornado pelo backend (`PARTICIPANTE` → `/inicio`, `ORGANIZADOR` → `/organizador`).
- O `ParticipantLayout` envolve tanto a vitrine pública quanto as telas autenticadas. O layout já trata o estado deslogado no topo (mostra "Entrar" em vez do avatar).
- As rotas do organizador são **aninhadas por evento** (`/organizador/eventos/:id/...`): o `:id` na URL é a fonte da verdade. O `OrganizerLayout` lê o id ativo via `useMatch`, hidrata o `Evento` uma vez (hook `useEvento`) e o repassa às páginas por `Outlet context` (`type OrgOutlet`). As páginas pegam o id por `useParams` (para a API) e o `evento` por `useOutletContext` (para o nome no breadcrumb). Não há mais "evento ativo" em `localStorage`.

---

## Domínio do negócio

O domínio é o mesmo do backend — consultar [`backend/docs/requirements.md`](../../backend/docs/requirements.md) para a tabela completa de entidades (Usuário, Evento, Lote, Ingresso, Pedido, Pagamento, Cupom, Cortesia, Check-in, Certificado, etc.).

No frontend, cada entidade aparece como:

- **Tipo TypeScript** em algum arquivo de `api/` (ex: `Usuario` em `api/auth.ts`).
- **Tela** ou seção em `pages/` (participant ou organizer).
- **Componente visual** em `components/` quando reutilizada (ex: `EventCard`, `StatusPill`).
