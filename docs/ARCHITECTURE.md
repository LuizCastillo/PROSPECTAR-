# ARCHITECTURE.md

## Pipeline principal

```
BUSCA → OPENSTREETMAP (OVERPASS) → NORMALIZAÇÃO → BANCO → ENRIQUECIMENTO →
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
│   ├── places/         # integração OpenStreetMap (Overpass + Nominatim)
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
│   ├── osm/             # clientes Overpass API + Nominatim (OpenStreetMap)
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
- [x] Fase 2 — busca de empresas via OpenStreetMap (Overpass API + Nominatim), sem custo e sem API key — inclui mapa Leaflet no frontend
- [ ] Fase 3 — website analyzer, brand analyzer, Lead Score
- [ ] Fase 4 — Business Analyzer, Website Strategist (bloqueada: falta `LLM_API_KEY`)
- [ ] Fase 5 — Prompt Engine, versionamento de prompts
- [ ] Fase 6 — CRM, histórico
- [ ] Fase 7 — testes, segurança, otimização
- [ ] Fase 8 — deploy final, documentação, validação

## Busca de empresas (Fase 2) — OpenStreetMap

Fluxo: `Frontend → Backend (Express) → Overpass API → OpenStreetMap → Backend → Frontend`.

- **Geocodificação:** `infrastructure/osm/nominatimClient.ts` transforma "cidade, estado" em lat/lon, com cache de 24h.
- **Busca:** `modules/places/segmentTagMap.ts` mapeia o segmento digitado (ex: "barbearia") para tags OSM (`shop=hairdresser`), com fallback textual para segmentos não mapeados.
- **Query:** `modules/places/overpassQueryBuilder.ts` monta a query Overpass QL (`nwr` + `around`), nunca a partir de input livre do usuário — só parâmetros validados por Zod no router.
- **Normalização:** `modules/places/normalizePlace.ts` converte o resultado cru do OSM; campo ausente vira `'UNKNOWN'`, nunca inventado.
- **Cache:** `TtlCache` em memória, 15min por combinação de busca, evita bater repetidamente no Overpass público.
- **Endpoint:** `POST /api/places/search { segment, city, state?, country?, radiusMeters?, maxResults? }`.
- **Mapa:** `frontend/src/components/map/PlacesMap.tsx`, Leaflet + tiles OpenStreetMap, marcador com popup mostrando os dados disponíveis.
