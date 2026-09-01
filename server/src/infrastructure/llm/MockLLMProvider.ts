import type {
  LLMProvider,
  GenerateBusinessAnalysisInput,
  GenerateWebsiteStrategyInput,
  GenerateWebsitePromptInput,
  GenerateOutreachMessageInput,
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
}
