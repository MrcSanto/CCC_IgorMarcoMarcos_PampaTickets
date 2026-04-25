# state.md — Estado Atual do Desenvolvimento

> Atualizar este arquivo ao final de cada sessão de desenvolvimento.
> Objetivo: garantir continuidade entre sessões sem precisar reexplicar o contexto.

---

## Última atualização

**Data:** 25/04/2026 (sessão 2)
**Responsável:** Marco Antonio Santolin

---

## O que foi implementado

- [x] UC01 — Autenticação JWT
- [x] UC02 — Gerenciamento de Eventos
- [ ] UC03 — Gerenciamento de Ingressos/Lotes
- [ ] UC04 — Check-in via QR Code
- [ ] UC05 — Cupons de desconto
- [ ] UC06 — Cortesias
- [ ] UC07 — Busca e Compra de Ingressos *(parcial — service e integração Asaas prontos, faltam rotas `/api/pedidos`)*
- [ ] UC09 — Pagamento via Asaas *(parcial — `pagamento_service.criar_pagamento` e integração HTTP prontos; falta rota real e fluxo end-to-end)*
- [ ] UC10 — Reembolso
- [ ] UC11 — Webhooks do Asaas *(parcial — `pagamento_service.processar_webhook` pronto; falta rota `/webhooks/asaas` e validação do header)*
- [ ] UC12 — Geração de Ingresso PDF
- [ ] UC13 — Geração de Certificado PDF
- [ ] UC14 — Relatório Financeiro PDF
- [ ] UC15 — Notificações WhatsApp
- [ ] UC08 — Galeria de Fotos (baixa prioridade)

---

## Em progresso

UC03 — Gerenciamento de Lotes (bloqueador para criar `Pedido` com FKs válidas e testar o gateway Asaas end-to-end).

---

## Próximo passo

1. Implementar UC03: `POST /api/eventos/{id}/lotes`, `GET /api/eventos/{id}/lotes`, `PUT` e ativação/desativação de lote.
2. Implementar `POST /api/pedidos` (UC07) — cria `Pedido` + `PedidoItem` e dispara `pagamento_service.criar_pagamento`.
3. Implementar `POST /webhooks/asaas` (UC11) — sem JWT, valida header `asaas-access-token`, chama `pagamento_service.processar_webhook`.
4. Remover a rota temporária [app/api/routes/pagamentos.py](../app/api/routes/pagamentos.py) após validar o fluxo real.

---

## Decisões tomadas nesta sessão

- **Autenticação (UC01)**: JWT + bcrypt para hash de senhas.
- **Onboarding local**: padronizado via `make build` + `make up` (substituiu `make install/migrate/dev` no README).
- **Arquitetura em camadas**: `models` → `repositories` → `services` → `routers`, usando SQLAlchemy `AsyncSession`.
- **Convenção de imports** nos repositórios: ordem alfabética (ex.: `PerfilUsuario, Usuario`).
- **Endpoints públicos**: apenas cadastro, login, listagem pública de eventos e webhook do Asaas.
- **Camada `integrations/`** (18/04/2026): chamadas HTTP a APIs externas (Asaas, Supabase, Meta) ficam isoladas em `app/integrations/<provedor>/`. Services orquestram, integrations traduzem protocolo. Regras completas em [requirements.md](requirements.md#camada-integrations--chamadas-a-apis-externas).
- **Asaas customer_id**: persistido em `usuarios.asaas_customer_id`. Primeira cobrança cria o cliente no Asaas; próximas reutilizam.
- **Sandbox Asaas** (25/04/2026): variável renomeada para `ASAAS_BASE_URL_UAT` para deixar explícito o ambiente de homologação.
- **Rota temporária** (25/04/2026): `POST /api/pagamentos` foi adicionada apenas para validar a persistência e está marcada para remoção assim que `POST /api/pedidos` entrar. Router comentado em `main.py` na sessão 2.
- **UC02 completo** (25/04/2026): 8 endpoints de eventos implementados. `GET /api/eventos/{id}` retorna 404 para RASCUNHO e CANCELADO — só PUBLICADO e ENCERRADO são visíveis publicamente. `OrganizadorUser` adicionado em `deps.py` para proteger rotas de escrita/transição de status. Publicar/encerrar/cancelar validam que o usuário é o dono do evento via `_obter_proprio`.

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