# LeadForge (PROSPECTAR-)

Ferramenta de proposta/onboarding para prospecção: você cadastra manualmente os dados de uma empresa que já está negociando (nome, endereço, identidade visual, especificações que o cliente pediu), e o sistema gera um protótipo de site (via LLM) para envio de aprovação, além do briefing + prompt completo para o desenvolvimento real. Nenhuma dependência de APIs externas de busca — todo dado vem de quem está usando o sistema.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS — deploy na Vercel
- **Backend:** Node.js + TypeScript + Express — deploy no Render
- **Banco:** Supabase / PostgreSQL (projeto `Prospectar`)
- **LLM:** camada `LLMProvider` desacoplada de fornecedor (ver `server/src/infrastructure/llm`) — gera análise de negócio, estratégia de site, prompt final e protótipo HTML

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

Projeto em construção por fases (ver `docs/ARCHITECTURE.md`). Fase atual: **cadastro manual de empresa + geração de protótipo**.

Integrações de LLM já configuradas:
- `GEMINI_API_KEY` — gera o protótipo do site (HTML estático)
- `GROQ_API_KEY` — gera o site completo (frontend + backend), usando o protótipo aprovado como referência

Enquanto essas chaves não estão presentes, os respectivos endpoints retornam erro claro (protótipo) ou um placeholder (nunca inventam dado da empresa).

## Fluxo

1. `/new-company` — cadastra a empresa: dados de contato, identidade visual (cores), e um campo de texto livre com as especificações/pedidos do cliente
2. `/companies/:id` (aba **Protótipo**) — gera uma versão de protótipo HTML estático via **Gemini**, com link direto pra mandar pro cliente aprovar
3. `/companies/:id` (aba **Site completo**) — depois de aprovado, gera o projeto completo (frontend + backend) via **Groq**, usando o protótipo como referência de layout — disponível como download em `.zip`
4. Próximas fases: Business Analyzer, Website Strategist e Prompt Engine de dev completo, usando os mesmos dados cadastrados manualmente
