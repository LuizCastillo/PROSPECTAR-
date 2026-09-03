import type {
  LLMProvider,
  GenerateBusinessAnalysisInput,
  GenerateWebsiteStrategyInput,
  GenerateWebsitePromptInput,
  GenerateOutreachMessageInput,
  GenerateWebsiteMockupInput,
  BusinessAnalysis,
  WebsiteStrategy,
} from './LLMProvider.js';

// Provider de desenvolvimento/demonstração. Não inventa fatos sobre a empresa —
// apenas devolve estruturas plausíveis para testar o pipeline sem gastar
// créditos de LLM real e sem exigir LLM_API_KEY configurada.
// Trocar para AnthropicLLMProvider assim que env.LLM_API_KEY estiver definida.
export class MockLLMProvider implements LLMProvider {
  async generateBusinessAnalysis(_input: GenerateBusinessAnalysisInput): Promise<BusinessAnalysis> {
    return {
      businessType: 'UNKNOWN',
      targetAudience: [],
      mainGoal: 'UNKNOWN',
      secondaryGoals: [],
      strengths: [],
      weaknesses: [],
      opportunities: [],
      recommendations: ['Configurar LLM_API_KEY para gerar análise real.'],
    };
  }

  async generateWebsiteStrategy(_input: GenerateWebsiteStrategyInput): Promise<WebsiteStrategy> {
    return {
      siteType: 'UNKNOWN',
      objective: 'UNKNOWN',
      primaryCTA: 'UNKNOWN',
      secondaryCTAs: [],
      pages: [],
      sections: [],
      features: [],
      uxStrategy: [],
      visualStrategy: [],
      seoStrategy: [],
      contentStrategy: [],
    };
  }

  async generateWebsitePrompt(_input: GenerateWebsitePromptInput): Promise<string> {
    return 'LLM_API_KEY não configurada. Configure o provider de LLM para gerar o prompt final.';
  }

  async generateOutreachMessage(_input: GenerateOutreachMessageInput): Promise<string> {
    return 'LLM_API_KEY não configurada.';
  }

  async generateWebsiteMockup(input: GenerateWebsiteMockupInput): Promise<string> {
    const name = String(input.companyFacts.name ?? 'Empresa');
    return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${name} — Protótipo</title></head>
<body style="font-family: system-ui; padding: 40px; text-align: center;">
  <h1>${name}</h1>
  <p>LLM_API_KEY não configurada — este é um placeholder do MockLLMProvider.</p>
  <p>Configure a chave para gerar o protótipo real com base nos dados e especificações informados.</p>
</body>
</html>`;
  }
}
