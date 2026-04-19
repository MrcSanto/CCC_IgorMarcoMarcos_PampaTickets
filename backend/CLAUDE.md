# CLAUDE.md — pampatickets (Backend)

Arquivo de índice. Não contém regras detalhadas — aponta para os documentos especializados em `docs/`.
Leia apenas o arquivo relevante para a tarefa em execução.

---

## Documentos de referência

| Arquivo | Quando ler |
|---|---|
| [`docs/project.md`](docs/project.md) | Visão geral, stack técnica e estrutura de pastas |
| [`docs/requirements.md`](docs/requirements.md) | Regras de arquitetura, domínio do negócio e casos de uso |
| [`docs/roadmap.md`](docs/roadmap.md) | Prioridades de implementação e integrações externas |
| [`docs/state.md`](docs/state.md) | Estado atual do desenvolvimento — atualizar a cada sessão |

---

## Regras globais (sempre aplicar)

- Gerenciamento de pacotes: **sempre `uv add`**, nunca `pip install`
- Comentários e mensagens de erro ao usuário: **português**
- Nomenclatura técnica: **inglês** (ex: `get_by_id`, `create_evento`)
- Commits: português, padrão `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Nenhum endpoint público sem justificativa — exceções: cadastro, login e listagem pública de eventos