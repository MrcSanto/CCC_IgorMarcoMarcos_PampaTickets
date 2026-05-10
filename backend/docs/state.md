# state.md — Estado Atual do Desenvolvimento

> Atualizar este arquivo ao final de cada sessão de desenvolvimento.
> Objetivo: garantir continuidade entre sessões sem precisar reexplicar o contexto.

---

## Última atualização

**Data:** 10/05/2026
**Responsável:** Marco Antonio Santolin

---

## O que foi implementado

- [x] UC01 — Autenticação JWT
- [x] UC02 — Gerenciamento de Eventos
- [x] UC03 — Gerenciamento de Ingressos/Lotes
- [x] UC04 — Check-in via QR Code
- [ ] UC05 — Cupons de desconto
- [ ] UC06 — Cortesias
- [x] UC07 — Busca e Compra de Ingressos
- [x] UC09 — Pagamento via Asaas
- [ ] UC10 — Reembolso
- [x] UC11 — Webhooks do Asaas
- [x] UC12 — Geração de Ingresso PDF
- [x] UC13 — Geração de Certificado PDF
- [ ] UC14 — Relatório Financeiro PDF
- [ ] UC15 — Notificações WhatsApp
- [ ] UC08 — Galeria de Fotos (baixa prioridade)

---

## Em progresso

Ciclo end-to-end de pagamento agora fechado e validado em sandbox: pedido → Asaas → webhook → ingressos criados com QR único → PDFs (quando Supabase configurado). Próxima frente é cancelar/reembolsar o que já foi pago e habilitar regras comerciais (cupom/cortesia).

---

## Próximo passo

1. **UC10 — Reembolso**: aproveitar a integração Asaas existente. Falta `pagamento_service.solicitar_reembolso` + rota `POST /api/pedidos/{id}/reembolso`. Quando `PAYMENT_REFUNDED` chegar, marcar também os ingressos como `CANCELADO` (hoje só atualiza pedido/pagamento).
2. **UC05 — Cupons de desconto**: modelo `Cupom` já existe em [app/models/cupom.py](../app/models/cupom.py); falta repositório, service, rotas CRUD e aplicação no fluxo de `POST /api/pedidos`.
3. **UC06 — Cortesias**: modelo `Cortesia` já existe em [app/models/cortesia.py](../app/models/cortesia.py); falta CRUD para o organizador emitir.
4. **UC14 — Relatório Financeiro PDF**: reaproveitar `app/reports/` e `supabase_storage` introduzidos no UC12/UC13.
5. **UC15 — Notificações WhatsApp**: criar `app/integrations/whatsapp/` (Meta Cloud API) e disparar em webhook/check-in/pagamento.

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
- **CORS habilitado** (29/04/2026 — MarcosP, commit `d177603`): `CORSMiddleware` registrado em [app/main.py](../app/main.py) permitindo o frontend local consumir a API. Origens precisam ser revistas antes de qualquer deploy.
- **Validação Mod 11 de CPF/CNPJ** (29/04/2026 — MarcosP): `app/core/validators.py` rejeita documentos inválidos antes de bater no Asaas. Aplicado em `schemas/usuario.py` e propagado por `auth_service.py`.
- **Tratamento de erros do Asaas** (29/04/2026 — MarcosP): `app/integrations/asaas/exceptions.py` mapeia respostas do gateway — 4xx vira `422` com detalhe original (mensagem acionável no frontend) e 5xx vira `502` genérico. Aplicado em `pedido_service.py`.
- **UC11 completo — Webhook Asaas** (03/05/2026 — Igor Zanette, commit `2b1c43e`): rota pública `POST /api/webhooks/asaas` em [app/api/routes/webhooks.py](../app/api/routes/webhooks.py), valida header `asaas-access-token` e chama `pagamento_service.processar_webhook`. Rota temporária `POST /api/pagamentos` removida do `main.py`.
- **UC04 completo — Check-in via QR Code** (03/05/2026 — Igor Zanette): rota `POST /checkin` em [app/api/routes/checkin.py](../app/api/routes/checkin.py). `ingresso_service.validar_checkin` marca o ingresso como `UTILIZADO` e dispara geração automática de certificado PDF.
- **UC12 completo — Ingresso em PDF** (03/05/2026 — Igor Zanette): gerador em [app/reports/ingresso_pdf.py](../app/reports/ingresso_pdf.py) (`gerar_pdf_ingresso`). Upload via [app/integrations/supabase_storage.py](../app/integrations/supabase_storage.py); URL persistida em `ingressos.pdf_url` por `ingresso_repo.update_pdf_url`. Disparado pelo webhook quando o pedido vira `PAGO`.
- **UC13 completo — Certificado em PDF** (03/05/2026 — Igor Zanette): `gerar_pdf_certificado` em `app/reports/ingresso_pdf.py`; upload no bucket `certificados/` via `supabase_storage.upload_certificado_pdf`. Disparado automaticamente após check-in bem-sucedido.
- **Supabase Storage** (03/05/2026 — Igor Zanette): camada `app/integrations/supabase_storage.py` isola o SDK; buckets configuráveis em `core/config.py` (`SUPABASE_BUCKET_INGRESSOS`, `SUPABASE_BUCKET_CERTIFICADOS`). Service degrada silenciosamente para `None` quando `SUPABASE_URL`/`SUPABASE_KEY` não estão configurados — não bloqueia desenvolvimento local.
- **Frontend containerizado** (09/05/2026 — Marco): `frontend/Dockerfile` (node:22-alpine) e serviço `frontend` no `docker-compose.yml` expondo `5173`. Vite configurado com `host: 0.0.0.0` e `strictPort` para acesso a partir do container.
- **Reorganização do Supabase** (10/05/2026 — Marco): pasta `app/integrations/supabase/` (com `__init__.py`) substitui o módulo solto `app/integrations/supabase_storage.py`. Import em `ingresso_service.py` corrigido (estava `backend.app.integrations...` — caminho de filesystem em vez de import Python).
- **Endpoint de health do webhook** (10/05/2026 — Marco): `GET /api/webhooks/asaas` retorna `{"status": "ok"}` para validar túnel ngrok antes de o Asaas mandar qualquer POST.
- **Make `db-reset`** (10/05/2026 — Marco): novo target `make db-reset` (`docker compose down -v && up -d`) zera o volume `postgres_data` e reaplica migrations. Destrutivo, dev-only.
- **Bug timezone-aware no `pago_em`** (10/05/2026 — Marco): asyncpg estourava `can't subtract offset-naive and offset-aware datetimes` ao salvar `pago_em` no webhook PAYMENT_CONFIRMED. Coluna é `TIMESTAMP WITHOUT TIME ZONE` mas o service passava `datetime.now(timezone.utc)` (tz-aware). Corrigido com `.replace(tzinfo=None)` no único call site (`pagamento_service.py`). Decisão: manter o padrão naive (todas as colunas DateTime do projeto são naive); refatorar para `DateTime(timezone=True)` em todas elas é trabalho maior, fica como dívida.
- **Depuração do webhook** (10/05/2026 — Marco): `webhooks.py` agora loga o payload bruto recebido (`logger.info`) e usa `logger.exception` no `try/except` ao redor de `processar_webhook` — antes só vinha "500 sem traceback" no log. Comentário enganoso "Log do erro (já é feito pelo middleware)" removido — o `LoggingMiddleware` só loga a linha de status, não o stack.
- **Helper `cancelamento_service.aplicar_cancelamento`** (10/05/2026 — Marco): `app/service/cancelamento_service.py` centraliza o fluxo "cancelar pedido completo" (devolve estoque via `lote_repo.decrementar_vendidas`, deleta cobrança no Asaas com `try/except AsaasAPIError`, atualiza pagamento e pedido). Usado por (a) `pedido_service.cancelar` (cancelamento manual, com `motivo_status_pagamento=CANCELADO`) e (b) webhook `PAYMENT_OVERDUE` (com `motivo=RECUSADO`). Idempotente — se pedido já está `CANCELADO`, retorna sem fazer nada. **Bug grave resolvido**: antes do refator, o webhook OVERDUE só atualizava status no banco, deixando lugares ocupados pra sempre e charges penduradas no Asaas.
- **`PAYMENT_CREATED` no webhook** (10/05/2026 — Marco): adicionado `elif evento == "PAYMENT_CREATED"` em `processar_webhook` que apenas faz `logger.info` indicando ignorado de propósito (cobrança já é registrada no fluxo síncrono de `criar_pagamento`). Evita confusão para quem ler o código depois.
- **UC07 — Criação de Ingressos pós-pagamento** (10/05/2026 — Marco): no webhook `PAYMENT_CONFIRMED/RECEIVED`, `ingresso_service.criar_ingressos_para_pedido` cria 1 `Ingresso` por unidade em cada `PedidoItem` (`item.quantidade` ingressos), com `qr_code_hash` único via `secrets.token_urlsafe(32)` e status `ATIVO`. Idempotente (se ingressos já existem para o pedido, retorna os existentes). Adicionada idempotência por status do pagamento no início do branch (`if pagamento.status == APROVADO: return`) para tolerar re-envio do webhook.
- **Endpoints de Ingresso** (10/05/2026 — Marco): `GET /api/ingressos/meus` (lista todos do participante autenticado, ordenados por `emitido_em` desc) e `GET /api/ingressos/{id}` (detalhe com 403 se não for o dono, 404 se não existir). Schema `IngressoResponse` em [app/schemas/ingresso.py](../app/schemas/ingresso.py) inclui `qr_code_hash`, `pdf_url`, `status` e dados desnormalizados de evento/lote para a tela do app.
- **Cadeia de bugs no PDF/Check-in resolvida** (10/05/2026 — Marco): o gerador de PDF e `validar_checkin` acessavam caminhos inexistentes (`ingresso.pedido.lote.evento`, `ingresso.pedido.usuario`, `ingresso.created_at`) — Ingresso tem `pedido_item_id`, não `pedido_id`, e os relationships não existiam. Tudo era engolido pelo `try/except` em `gerar_pdf_ingresso_upload`. Corrigido adicionando relationships nos models (`Ingresso.participante`, `Ingresso.lote`, `Ingresso.pedido_item`, `PedidoItem.lote`, `Lote.evento`) — sem migration, é apenas metadata SQLAlchemy. `ingresso_repo.get_with_relations` reescrito com `selectinload` correto. `get_by_pedido_id` corrigido para fazer JOIN em `PedidoItem` (antes filtrava por `Ingresso.pedido_id` que não existe — sempre retornava lista vazia).
- **Relationships com warning de overlap evitado** (10/05/2026 — Marco): `PedidoItem.pedido` foi adicionado e depois removido (não era usado em lugar nenhum) — gerava `SAWarning` por conflitar com `Pedido.itens`. Sobrou só `PedidoItem.lote`. Outros relationships novos não conflitam porque o lado oposto não tem inverso definido.

- **Testes**: ausência de suíte de testes para o fluxo de autenticação (UC01).
- **Refresh token**: definir se será implementado e qual estratégia (rotate/revoke).
- **Rate limiting** nos endpoints `/login` e `/cadastro`.
- **Validação de força de senha** no cadastro.
- **Migrações Alembic**: confirmar versionamento e execução automática via `make up`.
- ~~**Logs estruturados**~~ resolvido: loguru + `LoggingMiddleware` loga cada request. Tratamento global de exceções da API ainda pendente.
- **CORS em produção**: middleware habilitado, mas as origens precisam ser revistas antes de qualquer deploy.
- **Seed de dados** para desenvolvimento (usuário admin inicial).
- **Modelos sem rotas**: `Cupom` (UC05), `Cortesia` (UC06), `Reembolso` (UC10), `Relatorio` (UC14), `FotoEvento`/`CompraFoto` (UC08) — modelos ORM existem mas faltam repositório/service/rotas.
- **UC15 não iniciado**: integração com Meta Cloud API (WhatsApp) precisa ser criada do zero em `app/integrations/whatsapp/`.
- **`PAYMENT_REFUNDED` não cancela ingressos**: hoje só atualiza pedido para `REEMBOLSADO` e pagamento para `ESTORNADO`; os ingressos ficam `ATIVO` (entram no evento). Resolver junto com UC10.
- **`gerar_pdf_ingresso_upload` engole exceções silenciosamente**: o `try/except: return None` em `ingresso_service.py` esconde qualquer falha na geração de PDF. Trocar por `logger.exception` para diagnosticar problemas reais no Supabase.
- **Datetimes naive vs aware**: todas as colunas `DateTime` do projeto são naive (`TIMESTAMP WITHOUT TIME ZONE`), mas o código quase sempre usa `datetime.now(timezone.utc)`. Convivendo via `.replace(tzinfo=None)` no único call site. Refatorar para `DateTime(timezone=True)` em todos os models seria mais correto, mas exige migration grande.