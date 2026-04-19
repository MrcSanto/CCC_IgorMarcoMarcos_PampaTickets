# state.md — Estado Atual do Desenvolvimento

> Atualizar este arquivo ao final de cada sessão de desenvolvimento.
> Objetivo: garantir continuidade entre sessões sem precisar reexplicar o contexto.

---

## Última atualização

**Data:** 18/04/2026    
**Responsável:** Marco Antonio Santolin

---

## O que foi implementado

- [x] UC01 — Autenticação JWT
- [ ] UC02 — Gerenciamento de Eventos
- [ ] UC03 — Gerenciamento de Ingressos/Lotes
- [ ] UC04 — Check-in via QR Code
- [ ] UC05 — Cupons de desconto
- [ ] UC06 — Cortesias
- [ ] UC07 — Busca e Compra de Ingressos
- [ ] UC09 — Pagamento via Asaas
- [ ] UC10 — Reembolso
- [ ] UC11 — Webhooks do Asaas
- [ ] UC12 — Geração de Ingresso PDF
- [ ] UC13 — Geração de Certificado PDF
- [ ] UC14 — Relatório Financeiro PDF
- [ ] UC15 — Notificações WhatsApp
- [ ] UC08 — Galeria de Fotos (baixa prioridade)

---

## Em progresso

Incluido endpoints para autentiticação com JWT e bcrypt

---

## Próximo passo

Desenvolver o UC02, e UC03

---

## Decisões tomadas nesta sessão

- **Autenticação (UC01)**: JWT + bcrypt para hash de senhas.
- **Onboarding local**: padronizado via `make build` + `make up` (substituiu `make install/migrate/dev` no README).
- **Arquitetura em camadas**: `models` → `repositories` → `services` → `routers`, usando SQLAlchemy `AsyncSession`.
- **Convenção de imports** nos repositórios: ordem alfabética (ex.: `PerfilUsuario, Usuario`).
- **Endpoints públicos**: apenas cadastro, login, listagem pública de eventos e webhook do Asaas.
- **Camada `integrations/`** (18/04/2026): chamadas HTTP a APIs externas (Asaas, Supabase, Meta) ficam isoladas em `app/integrations/<provedor>/`. Services orquestram, integrations traduzem protocolo. Regras completas em [requirements.md](requirements.md#camada-integrations--chamadas-a-apis-externas).
- **Asaas customer_id**: persistido em `usuarios.asaas_customer_id`. Primeira cobrança cria o cliente no Asaas; próximas reutilizam.

---

## Problemas em aberto

- **Testes**: ausência de suíte de testes para o fluxo de autenticação (UC01).
- **Refresh token**: definir se será implementado e qual estratégia (rotate/revoke).
- **Rate limiting** nos endpoints `/login` e `/cadastro`.
- **Validação de força de senha** no cadastro.
- **Migrações Alembic**: confirmar versionamento e execução automática via `make up`.
- **Logs estruturados** e tratamento global de exceções da API.
- **CORS**: revisar origens permitidas antes de qualquer deploy.
- **Seed de dados** para desenvolvimento (usuário admin inicial).