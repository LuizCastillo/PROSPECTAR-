# LeadForge (PROSPECTAR-)

Sistema inteligente de prospecção: encontra empresas via Google Places, analisa presença digital e identidade visual, e gera um briefing + prompt completo para criação/redesign do site de cada empresa.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS — deploy na Vercel
- **Backend:** Node.js + TypeScript + Express — deploy no Render
- **Banco:** Supabase / PostgreSQL (projeto `Prospectar`)
- **LLM:** camada `LLMProvider` desacoplada de fornecedor (ver `server/src/infrastructure/llm`)

## Estrutura

```
frontend/     App React (SPA)
server/       API Express, organizada por domínio (modules/, infrastructure/, shared/)
supabase/     Migrations SQL do schema
docs/         Documentação técnica adicional
```

## Rodando localmente

### Backend
```bash
cd server
cp ../.env.example .env   # preencher com suas chaves
npm install
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Status do desenvolvimento

Projeto em construção por fases (ver `docs/ARCHITECTURE.md`). Fase atual: **Fase 1 — arquitetura, frontend base, backend, Supabase**.

Integrações pendentes de credencial:
- `GOOGLE_MAPS_API_KEY` — necessária para a Fase 2 (busca de empresas)
- `LLM_API_KEY` — necessária a partir da Fase 4 (Business Analyzer / Website Strategist / Prompt Engine)

Enquanto essas chaves não são configuradas, o sistema roda com um `MockLLMProvider` e a busca de empresas fica desabilitada — nada é inventado no lugar de dados reais.
