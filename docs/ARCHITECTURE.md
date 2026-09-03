# ARCHITECTURE.md

## Pipeline principal

```
CADASTRO MANUAL → BANCO → BUSINESS ANALYZER → BRAND (informado manualmente) →
LEAD SCORE → ESTRATÉGIA DE SITE → PROMPT ENGINE → PROMPT FINAL
                                 ↘ PROTÓTIPO (LLM) → LINK PARA APROVAÇÃO DO CLIENTE
```

Decisão de arquitetura (histórico): o sistema tentou primeiro Google Places, depois
OpenStreetMap/Overpass como fonte automática de dados de empresas. Ambos foram
abandonados — Overpass público tinha instabilidade de rede/timeout e, mais
importante, o usuário decidiu que faz mais sentido cadastrar manualmente os
dados de clientes com quem já está negociando, em vez de prospectar em massa.
Não há mais nenhuma integração de busca externa.

Cada etapa é independente e registra seu próprio status em `companies.pipeline_status`:
`DISCOVERED → IMPORTED → ENRICHING → ANALYZING → ANALYZED → PROMPT_READY` (ou `ERROR`).
Empresas cadastradas manualmente entram direto como `IMPORTED`.

## Backend — organização por domínio

```
server/src/
├── modules/            # um subdiretório por domínio de negócio
│   ├── companies/      # cadastro manual, listagem, geração de protótipo
│   ├── websites/       # análise de site (futuro)
│   ├── social/
│   ├── branding/       # análise de identidade visual
│   ├── analysis/        # BusinessAnalyzer
│   ├── scoring/         # Lead Score
│   ├── strategy/        # WebsiteStrategist
│   ├── prompts/         # PromptEngine
│   ├── crm/
│   └── llm/
├── infrastructure/
│   ├── supabase/        # cliente Supabase (service role)
│   └── llm/             # LLMProvider (interface) + implementações
├── shared/
│   ├── errors/          # AppError, errorHandler
│   ├── validation/       # schemas zod compartilhados
│   └── utils/            # env.ts (config validada)
└── app/                  # app.ts (Express), health.ts, index.ts (entrypoint)
```

Regra: nenhum módulo importa um provider concreto de LLM diretamente — todos dependem apenas de `infrastructure/llm/LLMProvider.ts` (a interface). A troca de fornecedor acontece em `infrastructure/llm/index.ts`.

## Princípio "não inventar dados"

Todo dado de empresa vem de digitação manual do usuário — ele é a fonte, não há
"confiabilidade" a rastrear como havia com OSM. O que continua valendo: a LLM
nunca declara como fato algo que não foi informado. Campos opcionais não
preenchidos ficam `null`/`undefined`, nunca um valor inventado. Ver
`server/src/infrastructure/llm/LLMProvider.ts`.

## Cadastro manual de empresa

- **Endpoint:** `POST /api/companies { name, category?, address?, city?, state?, postalCode?, phone?, website?, clientSpecifications?, visualIdentity? }`
- **Especificações do cliente:** campo de texto livre (`client_specifications`, coluna própria na tabela `companies`) — pedidos de personalização que alimentam a geração do protótipo e do prompt final.
- **Identidade visual:** cores primária/secundária/destaque, salvas em `brand_analysis` com `source: 'manual'`.
- **Listagem:** `GET /api/companies`. **Detalhe:** `GET /api/companies/:id` (inclui a marca mais recente).

## Geração de protótipo

- **Gerar:** `POST /api/companies/:id/mockup` — chama `llmProvider.generateWebsiteMockup()`, que recebe os dados da empresa, a identidade visual e as especificações do cliente, e devolve HTML/CSS estático autocontido (uma página só, sem build step, pronta pra abrir direto no navegador).
- Cada geração cria uma nova versão, salva na tabela `prompts` com `type: 'website_mockup'` (reaproveita a mesma estrutura de versionamento dos prompts de desenvolvimento).
- **Servir:** `GET /api/companies/:id/mockup/raw?version=N` retorna o HTML puro (`Content-Type: text/html`) — o link dessa rota é o que se manda pro cliente aprovar.
- Frontend: aba "Protótipo" em `/companies/:id`.

## Frontend — páginas

```
/login
/dashboard
/new-company
/leads
/leads/:id
/companies/:id (abas: Overview, ..., Protótipo, ...)
/companies/:companyId/prompts
/settings
```

## Fases (status)

- [x] Fase 1 — arquitetura, frontend base, backend, Supabase, GitHub
- [x] Cadastro manual de empresa + geração de protótipo via LLM (substituiu a Fase 2 original de busca automática)
- [ ] Business Analyzer, Website Strategist, Lead Score, Prompt Engine completo (bloqueados: falta `LLM_API_KEY`)
- [ ] CRM, histórico
- [ ] Testes, segurança, otimização
- [ ] Deploy final, documentação, validação
