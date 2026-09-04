import type { LLMProvider } from './LLMProvider.js';
import { MockLLMProvider } from './MockLLMProvider.js';

// Ponto único de composição para os métodos genéricos de análise/estratégia
// (Fase 4 — BusinessAnalyzer, WebsiteStrategist, Prompt Engine de dev).
// generateWebsiteMockup e a geração de site completo NÃO passam por aqui —
// são integrações dedicadas (geminiClient.ts / groqClient.ts), chamadas
// diretamente por modules/companies/companiesService.ts, porque o usuário
// optou por dois provedores concretos e específicos para esses dois papéis
// em vez de uma abstração genérica.
export const llmProvider: LLMProvider = new MockLLMProvider();
export type { LLMProvider } from './LLMProvider.js';
