# CLAUDE.md — pampatickets (Backend)

Guia de contexto e convenções do projeto para uso do Claude Code.
Este arquivo descreve **exclusivamente o backend** da aplicação.

---

## Visão Geral do Projeto

**pampatickets** é uma plataforma digital de gerenciamento de eventos e venda de ingressos online, desenvolvida como projeto acadêmico na Universidade de Passo Fundo (UPF). A solução é inspirada no Sympla, com identidade regional do Rio Grande do Sul.

O sistema segue arquitetura de microsserviços. Este repositório contém o **backend principal**, responsável por toda a lógica de negócio, autenticação e persistência de dados.

---

## Stack Técnica

- **Linguagem:** Python
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Migrações:** Alembic
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT (PyJWT), com controle de perfis (Organizador / Participante)
- **Geração de PDF:** ReportLab, executada de forma assíncrona via `asyncio`
- **Armazenamento de arquivos:** Supabase Storage (PDFs de ingressos, certificados e relatórios financeiros)
- **Gateway de pagamento:** Asaas (cobranças via Pix, boleto e cartão de crédito; sandbox gratuito para testes)
- **Notificações:** Meta Cloud API — WhatsApp Business (confirmação de compra, envio de QR Code, lembretes de evento)
- **Documentação de API:** Swagger UI (nativa do FastAPI)
- **Gerenciamento de pacotes:** uv
- **Testes:** Pytest + HTTPX

---

## Estrutura de Pastas

```
pampatickets/
└── app/
    ├── api/
    │   ├── middlewares/
    │   │   ├── __init__.py
    │   │   └── request_id.py          # Middleware de rastreamento de requisições
    │   ├── routes/
    │   │   ├── __init__.py
    │   │   ├── auth.py                # Endpoints de autenticação e cadastro
    │   │   ├── eventos.py             # Endpoints de criação e gerenciamento de eventos
    │   │   ├── ingressos.py           # Endpoints de lotes e ingressos
    │   │   ├── pedidos.py             # Endpoints de pedidos e compras
    │   │   ├── cupons.py              # Endpoints de cupons de desconto
    │   │   ├── cortesias.py           # Endpoints de ingressos cortesia
    │   │   ├── checkin.py             # Endpoints de check-in via QR Code
    │   │   ├── galeria.py             # Endpoints de galeria de fotos (baixa prioridade)
    │   │   ├── relatorios.py          # Endpoints de relatórios PDF
    │   │   └── webhooks.py            # Endpoint receptor de webhooks do Asaas
    │   ├── __init__.py
    │   └── deps.py                    # Dependências compartilhadas (ex: get_db, get_current_user)
    ├── core/
    │   ├── __init__.py
    │   ├── config.py                  # Configurações da aplicação via variáveis de ambiente
    │   ├── logging_config.py          # Configuração de logs estruturados
    │   ├── logging_context.py         # Contexto de logging por requisição
    │   └── scheduler_utils.py         # Utilitários para tarefas agendadas (se aplicável)
    ├── db/
    │   ├── __init__.py
    │   ├── base.py                    # Base declarativa do SQLAlchemy + importação dos models
    │   └── session.py                 # Criação do engine e SessionLocal
    ├── models/
    │   ├── __init__.py
    │   ├── usuario.py                 # Entidade Usuário (organizador e participante)
    │   ├── evento.py                  # Entidade Evento
    │   ├── lote.py                    # Entidade Lote de ingressos
    │   ├── ingresso.py                # Entidade Ingresso individual
    │   ├── pedido.py                  # Entidade Pedido de compra
    │   ├── pagamento.py               # Entidade Pagamento / transação
    │   ├── cupom.py                   # Entidade Cupom de desconto
    │   ├── cortesia.py                # Entidade Cortesia
    │   ├── checkin.py                 # Entidade registro de Check-in
    │   ├── foto.py                    # Entidade Foto da galeria
    │   └── certificado.py             # Entidade Certificado de participação
    ├── repositories/
    │   ├── __init__.py
    │   ├── base_repo.py               # Repositório base com operações CRUD genéricas
    │   ├── usuario_repo.py
    │   ├── evento_repo.py
    │   ├── lote_repo.py
    │   ├── ingresso_repo.py
    │   ├── pedido_repo.py
    │   ├── cupom_repo.py
    │   ├── cortesia_repo.py
    │   ├── checkin_repo.py
    │   ├── foto_repo.py
    │   └── certificado_repo.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── usuario.py                 # DTOs Pydantic de entrada e saída para Usuário
    │   ├── evento.py
    │   ├── lote.py
    │   ├── ingresso.py
    │   ├── pedido.py
    │   ├── pagamento.py
    │   ├── cupom.py
    │   ├── cortesia.py
    │   ├── checkin.py
    │   ├── foto.py
    │   └── certificado.py
    ├── service/
    │   ├── __init__.py
    │   ├── auth_service.py            # Lógica de autenticação, JWT e cadastro
    │   ├── evento_service.py
    │   ├── ingresso_service.py
    │   ├── pedido_service.py
    │   ├── pagamento_service.py       # Integração com Asaas (criação de cobranças e reembolsos)
    │   ├── webhook_service.py         # Processamento dos webhooks recebidos do Asaas
    │   ├── whatsapp_service.py        # Integração com Meta Cloud API (envio de mensagens WhatsApp)
    │   ├── cupom_service.py
    │   ├── cortesia_service.py
    │   ├── checkin_service.py
    │   ├── galeria_service.py         # Baixa prioridade
    │   └── relatorio_service.py       # Coordena geração assíncrona de PDFs
    ├── reports/
    │   ├── __init__.py
    │   ├── ingresso_pdf.py            # Geração do ingresso em PDF com QR Code (UC12)
    │   ├── certificado_pdf.py         # Geração do certificado em PDF (UC13)
    │   └── relatorio_financeiro_pdf.py # Geração do relatório financeiro em PDF (UC14)
    ├── __init__.py
    └── main.py                        # Ponto de entrada da aplicação FastAPI
```

---

## Regras de Arquitetura

### Separação de Camadas (obrigatório)

| Camada | Responsabilidade |
|---|---|
| `models/` | Entidades ORM (SQLAlchemy). Nunca expostas diretamente na API. |
| `schemas/` | DTOs Pydantic para entrada e saída de dados da API. |
| `repositories/` | Acesso ao banco de dados. Sem lógica de negócio. |
| `service/` | **Toda** a lógica de negócio. Nunca acessa `routes/` diretamente. |
| `api/routes/` | Endpoints REST. Sem lógica de negócio — delegam tudo para `service/`. |
| `reports/` | Módulo isolado de geração de PDF. Sem acoplamento com `routes/`. |

### Regras de Código

1. **Routers nunca contêm lógica de negócio** — apenas recebem a requisição, chamam o service e retornam a resposta.
2. **Nunca retorne entidades SQLAlchemy diretamente** — sempre use Schemas Pydantic como resposta de endpoint.
3. **Valide todos os inputs via Pydantic** antes de chegar à camada de serviço.
4. **Geração de PDF é sempre assíncrona** — nunca bloqueie a API durante a geração de documentos.
5. **Nenhum endpoint é público sem motivo explícito** — os únicos endpoints sem autenticação JWT são: cadastro, login e listagem pública de eventos.
6. **Repositórios são os únicos responsáveis pelo acesso ao banco** — services nunca usam a sessão do banco diretamente.

---

## Domínio do Negócio

| Entidade | Descrição |
|---|---|
| **Usuário** | Organizador ou participante de eventos |
| **Evento** | Show, festival, teatro ou outro acontecimento |
| **Lote** | Agrupamento de ingressos com tipo, preço e quantidade |
| **Ingresso** | Unidade adquirida por um usuário para um evento |
| **Pedido** | Agrupamento de ingressos de uma compra |
| **Pagamento** | Transação financeira associada a um pedido |
| **Cupom** | Desconto aplicável durante a compra de ingressos |
| **Cortesia** | Ingresso gratuito emitido diretamente pelo organizador |
| **Check-in** | Validação da entrada do participante via QR Code |
| **Certificado** | Documento PDF gerado após check-in confirmado |
| **Foto** | Imagem do evento publicada na galeria pelo organizador |
| **Relatório** | PDF financeiro com dados de vendas, reembolsos e receita |

---

## Casos de Uso (UC)

| UC | Descrição | Prioridade |
|---|---|---|
| UC01 | Autenticar (login, cadastro, recuperação de senha) | Alta |
| UC02 | Gerenciar Evento (criar, editar, publicar, encerrar, cancelar) | Alta |
| UC03 | Gerenciar Ingressos (lotes, tipos, preços, quantidades) | Alta |
| UC04 | Realizar Check-in (validação por QR Code) | Alta |
| UC05 | Gerenciar Cupons de desconto | Alta |
| UC06 | Gerenciar Cortesias | Alta |
| UC07 | Buscar e Comprar Ingressos | Alta |
| UC09 | Processar Pagamento via Asaas (Pix, boleto, cartão) | Alta |
| UC10 | Emitir Reembolso via Asaas (cancelamento de evento) | Alta |
| UC11 | Receber Webhooks do Asaas (notificação de status de pagamento) | Alta |
| UC12 | Gerar Ingresso PDF com QR Code | Alta |
| UC13 | Gerar Certificado PDF | Alta |
| UC14 | Gerar Relatório Financeiro PDF | Média |
| UC15 | Notificar Participante via WhatsApp (confirmação de compra, QR Code, lembretes) | Média |
| UC08 | Galeria de Fotos do Evento | **Baixa** — implementar por último |

---

## Convenções de Código

- **Idioma:** comentários, nomes de variáveis de domínio e mensagens de erro voltadas ao usuário em **português**.
- **Nomenclatura técnica:** segue as convenções da linguagem em inglês (ex: `get_by_id`, `create_evento`, `handle_submit`).
- **Commits:** mensagens em português, seguindo o padrão: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`.

---

## Armazenamento de Arquivos — Supabase Storage

Todos os arquivos PDF gerados pelo sistema (ingressos, certificados e relatórios financeiros) são armazenados no **Supabase Storage**, não no servidor local.

### Decisão arquitetural

O Supabase Storage foi escolhido por:
- Integração natural com o PostgreSQL já utilizado no projeto
- Tier gratuito suficiente para o escopo acadêmico
- SDK simples (`supabase-py`) com suporte a upload, download e geração de URLs assinadas
- Elimina a necessidade de configurar um servidor de arquivos próprio

### Fluxo de geração e armazenamento de PDF

```
Requisição → FastAPI (BackgroundTasks) → reports/ (ReportLab)
    → upload para Supabase Storage → URL salva no PostgreSQL
    → URL retornada ao cliente para download
```

### Buckets utilizados

| Bucket | Conteúdo | UC |
|---|---|---|
| `ingressos` | PDFs de ingressos com QR Code | UC12 |
| `certificados` | PDFs de certificados de participação | UC13 |
| `relatorios` | PDFs de relatórios financeiros | UC14 |

### Convenções de nomenclatura dos arquivos

```
ingressos/{evento_id}/{pedido_id}/{ingresso_id}.pdf
certificados/{evento_id}/{usuario_id}.pdf
relatorios/{evento_id}/{timestamp}.pdf
```

### Regras de acesso

- Buckets de ingressos e certificados usam **URLs assinadas** com expiração — o participante acessa via link temporário enviado por e-mail ou exibido na plataforma.
- Bucket de relatórios é **privado** — apenas o organizador autenticado pode gerar e acessar via URL assinada.
- As URLs geradas são salvas nas tabelas `ingressos`, `certificados` e `relatorios` no PostgreSQL, respectivamente.

---

## Variáveis de Ambiente (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pampatickets
SECRET_KEY=sua-chave-secreta-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Supabase
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_KEY=sua-service-role-key
SUPABASE_BUCKET_INGRESSOS=ingressos
SUPABASE_BUCKET_CERTIFICADOS=certificados
SUPABASE_BUCKET_RELATORIOS=relatorios

# Asaas
ASAAS_API_KEY=sua-api-key-asaas
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3  # trocar para produção quando necessário
ASAAS_WEBHOOK_TOKEN=token-para-validar-webhooks

# Meta Cloud API — WhatsApp Business
META_WHATSAPP_TOKEN=seu-token-de-acesso
META_PHONE_NUMBER_ID=id-do-numero-whatsapp
META_VERIFY_TOKEN=token-de-verificacao-webhook
```

---

## Integração com Asaas (Gateway de Pagamento)

O Asaas é o gateway de pagamento utilizado para processar cobranças de ingressos e reembolsos. Em ambiente de desenvolvimento, utilizar sempre o **sandbox** (`https://sandbox.asaas.com/api/v3`).

### Métodos de pagamento suportados
- Pix (preferencial)
- Boleto bancário
- Cartão de crédito

### Fluxo de pagamento

```
Participante finaliza compra
    → pagamento_service cria cobrança no Asaas
    → Asaas retorna link/QR Code de pagamento
    → Participante efetua o pagamento
    → Asaas dispara webhook para /api/routes/webhooks.py
    → webhook_service processa o evento e atualiza status do pedido
    → Se confirmado: aciona geração do ingresso PDF e notificação WhatsApp
    → Se cancelado/expirado: pedido é marcado como falho
```

### Eventos de webhook relevantes

| Evento Asaas | Ação no sistema |
|---|---|
| `PAYMENT_CONFIRMED` | Confirma pedido, gera ingresso PDF, notifica participante |
| `PAYMENT_RECEIVED` | Mesmo fluxo de confirmação (Pix instantâneo) |
| `PAYMENT_OVERDUE` | Marca pedido como expirado, libera estoque do lote |
| `PAYMENT_REFUNDED` | Confirma reembolso, notifica participante |

### Regras importantes
- O endpoint de webhook (`POST /webhooks/asaas`) é **público** (sem JWT), mas deve validar o token de autenticação enviado pelo Asaas no header.
- Nunca liberar ingresso sem confirmação via webhook — não confiar apenas na resposta da criação da cobrança.
- Sempre usar o `id` da cobrança do Asaas como referência externa na tabela `pagamentos`.

### Expondo o webhook em desenvolvimento local

O Asaas precisa de uma URL pública para disparar os webhooks. Em desenvolvimento local, use **ngrok** para criar um túnel reverso:

```bash
# Instalar o ngrok (https://ngrok.com/download)
# Após criar conta e autenticar:
ngrok config add-authtoken SEU_TOKEN

# Expor a porta do FastAPI
ngrok http 8000
```

O ngrok fornece uma URL pública (ex: `https://abc123.ngrok-free.app`). Cadastre-a no painel do Asaas como:

```
https://abc123.ngrok-free.app/webhooks/asaas
```

**Atenção:** no plano gratuito do ngrok a URL muda a cada reinicialização — será necessário atualizar no painel do Asaas sempre que isso ocorrer. Alternativas para URL fixa gratuita: **Cloudflare Tunnel**.

Em **produção** esse problema não existe — a aplicação estará em um servidor com domínio público fixo.

---

## Integração com Meta Cloud API — WhatsApp Business

O WhatsApp é utilizado para notificar o participante em momentos-chave do fluxo do evento.

### Gatilhos de notificação

| Momento | Mensagem enviada |
|---|---|
| Pagamento confirmado | Confirmação da compra + link para download do ingresso PDF |
| Check-in realizado | QR Code do certificado ou link para download |
| Véspera do evento | Lembrete com data, hora e local do evento |
| Evento cancelado | Aviso de cancelamento + informações sobre reembolso |

### Regras importantes
- O envio de mensagens é **sempre assíncrono** via `BackgroundTasks` — nunca bloqueia o fluxo principal.
- Utilizar apenas **templates aprovados** pela Meta para mensagens iniciadas pelo sistema (fora da janela de 24h).
- O `whatsapp_service` é o único responsável por montar e enviar mensagens — nenhum outro service acessa a API da Meta diretamente.
- O número de telefone do participante deve estar no formato internacional: `+55DDNÚMERO`.

---

## Como Rodar o Projeto

O projeto utiliza **uv** para gerenciamento de pacotes e ambientes virtuais.

```bash
# Instalar o uv (caso não tenha)
curl -Ls https://astral.sh/uv/install.sh | sh

# Criar o ambiente virtual e instalar dependências
uv sync

# Aplicar migrações do banco de dados
uv run alembic upgrade head

# Iniciar o servidor de desenvolvimento
uv run uvicorn app.main:app --reload
```

### Gerenciamento de dependências com uv

```bash
# Adicionar uma nova dependência
uv add <pacote>

# Adicionar dependência apenas para desenvolvimento/testes
uv add --dev <pacote>

# Remover uma dependência
uv remove <pacote>

# Rodar testes
uv run pytest
```

---

## Observações para o Claude Code

- Ao criar um novo endpoint, **sempre** crie o schema, o service e o repositório correspondentes antes do router.
- Ao gerar PDFs, utilize sempre o módulo `reports/` de forma assíncrona via `asyncio.create_task` ou `BackgroundTasks` do FastAPI.
- Após gerar o PDF, o upload para o Supabase Storage e o salvamento da URL no banco devem ocorrer **dentro do mesmo fluxo assíncrono** — nunca salve a URL antes de confirmar o upload.
- Ao adicionar um novo model, lembre de importá-lo em `db/base.py` para que o Alembic detecte a migração automaticamente.
- Testes ficam na pasta `tests/` na raiz do projeto, espelhando a estrutura de `app/` (ex: `tests/service/test_evento_service.py`).
- **Nunca use `pip install` diretamente** — sempre gerencie dependências via `uv add` para manter o `pyproject.toml` e o `uv.lock` atualizados.