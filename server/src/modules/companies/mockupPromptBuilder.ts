export interface MockupPromptInput {
  companyFacts: {
    name: string;
    category?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    website?: string | null;
  };
  visualIdentity?: { primaryColor?: string | null; secondaryColor?: string | null; accentColor?: string | null };
  clientSpecifications?: string | null;
}

// Instrui o Gemini a devolver SÓ o HTML — sem explicações, sem markdown —
// pra podermos servir a resposta direto como página, sem parsing extra.
export function buildMockupPrompt(input: MockupPromptInput): string {
  const { companyFacts, visualIdentity, clientSpecifications } = input;

  const facts = [
    `Nome: ${companyFacts.name}`,
    companyFacts.category && `Categoria/segmento: ${companyFacts.category}`,
    companyFacts.address && `Endereço: ${companyFacts.address}`,
    [companyFacts.city, companyFacts.state].filter(Boolean).length > 0 &&
      `Cidade/Estado: ${[companyFacts.city, companyFacts.state].filter(Boolean).join(', ')}`,
    companyFacts.phone && `Telefone: ${companyFacts.phone}`,
    companyFacts.website && `Site atual: ${companyFacts.website}`,
  ]
    .filter(Boolean)
    .join('\n');

  const colors = visualIdentity
    ? [
        visualIdentity.primaryColor && `Cor primária: ${visualIdentity.primaryColor}`,
        visualIdentity.secondaryColor && `Cor secundária: ${visualIdentity.secondaryColor}`,
        visualIdentity.accentColor && `Cor de destaque: ${visualIdentity.accentColor}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return `Você é um designer/desenvolvedor front-end. Gere um PROTÓTIPO de site em UM ÚNICO arquivo HTML autocontido (CSS inline em <style>, sem dependências externas, sem JavaScript de build) para a empresa abaixo.

DADOS DA EMPRESA (use exatamente estes dados — NUNCA invente telefone, endereço, horário ou qualquer informação que não esteja aqui; se algo não foi informado, simplesmente não inclua esse campo na página):
${facts}

${colors ? `IDENTIDADE VISUAL (use estas cores como base da paleta do site):\n${colors}\n` : ''}
${clientSpecifications ? `ESPECIFICAÇÕES/PEDIDOS DO CLIENTE (siga estas instruções à risca):\n${clientSpecifications}\n` : ''}

REQUISITOS:
- Página única, responsiva, visualmente profissional (não um wireframe cinza).
- Estrutura sugerida: header com nome da empresa, seção hero, seção de serviços/destaques, seção de contato/localização (só com os dados informados acima), footer.
- Não inclua nenhum dado de contato, endereço, horário, preço ou serviço que não tenha sido informado explicitamente acima.
- Não inclua comentários explicando o código, não use markdown, não use blocos de código com \`\`\`.

Responda APENAS com o HTML completo, começando em <!doctype html> e terminando em </html>. Nada antes, nada depois.`;
}
