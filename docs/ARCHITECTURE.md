# ARCHITECTURE.md

## Pipeline principal

```
BUSCA → GOOGLE PLACES → NORMALIZAÇÃO → BANCO → ENRIQUECIMENTO →
ANÁLISE DE SITE → ANÁLISE DE IDENTIDADE VISUAL → ANÁLISE DE NEGÓCIO →
LEAD SCORE → ESTRATÉGIA DE SITE → PROMPT ENGINE → PROMPT FINAL
```

Cada etapa é independente e registra seu próprio status em `companies.pipeline_status`:
`DISCOVERED → IMPORTED → ENRICHING → ANALYZING → ANALYZED → PROMPT_READY` (ou `ERROR`).

## Backend — organização por domínio

```
server/src/
├── modules/            # um subdiretório por domínio de negócio
│   ├── companies/
│   ├── places/         # integração Google Places
│   ├── websites/       # análise de site
│   ├── social/
│   ├── branding/       # análise de identidade visual
│   ├── analysis/        # BusinessAnalyzer
│   ├── scoring/         # Lead Score
│   ├── strategy/        # WebsiteStrategist
│   ├── prompts/         # PromptEngine
│   ├── crm/
│   └── llm/
├── infrastructure/
│   ├── google/          # cliente Google Places
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

Todo valor factual sobre uma empresa (telefone, endereço, horário, etc.) que passa pela LLM ou é armazenado carrega proveniência:

```ts
{ value: string | 'UNKNOWN' | 'NOT_FOUND', source: string, confidence: number, collectedAt: string }
```

A LLM interpreta e recomenda; nunca declara um fato sem essa estrutura por trás. Ver `server/src/infrastructure/llm/LLMProvider.ts`.

## Frontend — páginas

```
/login
/dashboard
/search
/leads
/leads/:id
/companies/:id (+ /analysis, /strategy)
/companies/:companyId/prompts
/settings
```

Todas já roteadas em `frontend/src/router.tsx`, com estados vazios explícitos em vez de dado fake, até cada fase do backend estar pronta.

## Fases (status)

- [x] Fase 1 — arquitetura, frontend base, backend, Supabase, GitHub
- [ ] Fase 2 — Google Places, pesquisa, importação (bloqueada: falta `GOOGLE_MAPS_API_KEY`)
- [ ] Fase 3 — website analyzer, brand analyzer, Lead Score
- [ ] Fase 4 — Business Analyzer, Website Strategist (bloqueada: falta `LLM_API_KEY`)
- [ ] Fase 5 — Prompt Engine, versionamento de prompts
- [ ] Fase 6 — CRM, histórico
- [ ] Fase 7 — testes, segurança, otimização
- [ ] Fase 8 — deploy final, documentação, validação
