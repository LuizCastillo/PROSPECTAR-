export interface SitePromptInput {
  companyFacts: {
    name: string;
    category?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    website?: string | null;
  };
  approvedMockupHtml: string;
  clientSpecifications?: string | null;
}

// O protótipo aprovado (gerado pelo Gemini) entra como REFERÊNCIA visual e
// estrutural — o Groq não parte do zero, ele implementa em cima do que já
// foi aprovado pelo cliente. Pedimos JSON estruturado (path + content) em
// vez de texto livre, pra conseguir montar um projeto de verdade (zip) no
// backend sem precisar adivinhar onde cada arquivo começa/termina.
export function buildSitePrompt(input: SitePromptInput): string {
  const { companyFacts, approvedMockupHtml, clientSpecifications } = input;

  const facts = [
    `Nome: ${companyFacts.name}`,
    companyFacts.category && `Categoria/segmento: ${companyFacts.category}`,
    companyFacts.address && `Endereço: ${companyFacts.address}`,
    [companyFacts.city, companyFacts.state].filter(Boolean).length > 0 &&
      `Cidade/Estado: ${[companyFacts.city, companyFacts.state].filter(Boolean).join(', ')}`,
    companyFacts.phone && `Telefone: ${companyFacts.phone}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `Você é um desenvolvedor full-stack. O cliente JÁ APROVOU o protótipo visual abaixo. Sua tarefa é gerar um projeto completo (frontend + backend) que implemente esse mesmo visual/estrutura de forma funcional.

PROTÓTIPO APROVADO (use como referência de layout, cores e conteúdo — não mude o visual sem necessidade):
\`\`\`html
${approvedMockupHtml}
\`\`\`

DADOS DA EMPRESA (nunca invente dado que não esteja aqui):
${facts}

${clientSpecifications ? `ESPECIFICAÇÕES ADICIONAIS DO CLIENTE:\n${clientSpecifications}\n` : ''}

REQUISITOS TÉCNICOS:
- Frontend: HTML/CSS/JS simples (sem framework pesado), fiel ao protótipo aprovado.
- Backend: Node.js + Express mínimo, servindo os arquivos estáticos do frontend e expondo pelo menos uma rota funcional (ex: endpoint de contato).
- Inclua um package.json com um script "start" que sobe o servidor.
- Projeto pequeno e funcional — não adicione dependências desnecessárias.

FORMATO DE RESPOSTA — MUITO IMPORTANTE:
Responda APENAS com um JSON no formato:
{"files": [{"path": "index.html", "content": "..."}, {"path": "server.js", "content": "..."}, {"path": "package.json", "content": "..."}]}

Não inclua nenhum texto antes ou depois do JSON. Não use markdown/blocos de código. O JSON deve ser válido e completo.`;
}
