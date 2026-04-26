# state.md — Estado Atual do Desenvolvimento

> Atualizar este arquivo ao final de cada sessão de desenvolvimento.
> Objetivo: garantir continuidade entre sessões sem precisar reexplicar o contexto.

---

## Última atualização

**Data:** 26/04/2026
**Responsável:** Marco Antonio Santolin

---

## O que foi implementado

- [x] UC01 — Autenticação JWT
- [x] UC02 — Gerenciamento de Eventos
- [x] UC03 — Gerenciamento de Ingressos/Lotes
- [ ] UC04 — Check-in via QR Code
- [ ] UC05 — Cupons de desconto
- [ ] UC06 — Cortesias
- [x] UC07 — Busca e Compra de Ingressos
- [x] UC09 — Pagamento via Asaas
- [ ] UC10 — Reembolso
- [ ] UC11 — Webhooks do Asaas *(parcial — `pagamento_service.processar_webhook` pronto; falta rota `/webhooks/asaas` e validação do header)*
- [ ] UC12 — Geração de Ingresso PDF
- [ ] UC13 — Geração de Certificado PDF
- [ ] UC14 — Relatório Financeiro PDF
- [ ] UC15 — Notificações WhatsApp
- [ ] UC08 — Galeria de Fotos (baixa prioridade)

---

## Em progresso

UC11 — webhook do Asaas. Última peça para o ciclo end-to-end: participante paga → Asaas notifica → pedido vira PAGO.

---

## Próximo passo

1. Implementar `POST /webhooks/asaas` (UC11) — sem JWT, valida header `asaas-access-token`, chama `pagamento_service.processar_webhook` (já existe).
2. Remover a rota temporária [app/api/routes/pagamentos.py](../app/api/routes/pagamentos.py) (router já comentado em `main.py`) após validar o fluxo real.

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
- **UC03 completo** (25/04/2026): 7 endpoints de lotes (`POST/GET /api/eventos/{id}/lotes`, `GET /api/organizador/eventos/{id}/lotes`, `PUT/PATCH(ativar|desativar)/DELETE /api/lotes/{id}`). Lotes só podem ser gerenciados em eventos `RASCUNHO` ou `PUBLICADO` (409 caso contrário). `LoteResponse` expõe `quantidade_disponivel` via `@computed_field`. `DELETE` só permitido se `quantidade_vendida == 0`. Posse validada via `_obter_lote_proprio` (lote → evento → checa `organizador_id`).
- **UC03 refinamentos** (25/04/2026): campo `ativo` exposto no `LoteCreate` (default `true`) — organizador escolhe o estado inicial na criação. Validação de datas de venda contra o evento: `data_inicio_venda < evento.data_inicio` e `data_fim_venda <= evento.data_inicio` (422 caso contrário), aplicada em `criar` e `editar`.
- **Logging estruturado** (25/04/2026): `loguru` instalado. `LoggingMiddleware` registrado em `main.py` — loga method, path, status_code, duration_ms, IP e request_id por request. `setup_logging()` chamado no lifespan. `print()` em `auth_service.py` substituído por `logger.error()`.
- **UC07 completo** (25/04/2026): 4 endpoints (`POST /api/pedidos`, `GET /api/pedidos/meus`, `GET /api/pedidos/{id}`, `POST /api/pedidos/{id}/cancelar`). Criação atômica (flush + commit único) de `Pedido` + `PedidoItem` + incremento de `quantidade_vendida`. Cobrança Asaas gerada após commit. Cancelamento valida status PENDENTE e devolve estoque. `ParticipanteUser` adicionado em `deps.py`.
- **UC09 completo** (26/04/2026): `pagamento_service.criar_pagamento` integrado ao `POST /api/pedidos`. Cancelamento deleta cobrança no Asaas e atualiza pagamento para `CANCELADO`. `StatusPagamento.CANCELADO` adicionado ao enum (migration gerada). `delete_charge` adicionado em `integrations/asaas/charges.py`.
- **Celular não-único** (26/04/2026): removido `unique=True` de `usuarios.celular` — múltiplas contas podem compartilhar o mesmo número (migration gerada).
- **PIX QR Code** (26/04/2026): `POST /api/pedidos` retorna campo `pix_qrcode` (`encodedImage` + `payload`) quando `metodo == PIX`; `null` para outros métodos. Falha na busca do QR code é silenciada com `logger.warning` — não interrompe a criação do pedido.
- **Ruff** (26/04/2026): configurado em `pyproject.toml` com `exclude = ["alembic/versions"]` — migrations são geradas automaticamente e não devem ser lintadas.

---

## Problemas em aberto

- **Testes**: ausência de suíte de testes para o fluxo de autenticação (UC01).
- **Refresh token**: definir se será implementado e qual estratégia (rotate/revoke).
- **Rate limiting** nos endpoints `/login` e `/cadastro`.
- **Validação de força de senha** no cadastro.
- **Migrações Alembic**: confirmar versionamento e execução automática via `make up`.
- ~~**Logs estruturados**~~ resolvido: loguru + `LoggingMiddleware` loga cada request. Tratamento global de exceções da API ainda pendente.
- **CORS**: revisar origens permitidas antes de qualquer deploy.
- **Seed de dados** para desenvolvimento (usuário admin inicial).