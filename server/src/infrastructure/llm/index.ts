import { env } from '@shared/utils/env.js';
import type { LLMProvider } from './LLMProvider.js';
import { MockLLMProvider } from './MockLLMProvider.js';

// Ponto único de composição. O resto do sistema depende apenas da interface
// LLMProvider (LLMProvider.ts) — nunca importa um provider concreto direto.
// Quando LLM_API_KEY estiver configurada e LLM_PROVIDER for 'anthropic',
// trocar aqui para uma implementação real (AnthropicLLMProvider), a ser
// adicionada quando a chave estiver disponível.
function createLLMProvider(): LLMProvider {
  if (env.LLM_PROVIDER === 'mock' || !env.LLM_API_KEY) {
    return new MockLLMProvider();
  }

  // TODO: implementar AnthropicLLMProvider (e outros) quando LLM_API_KEY
  // for configurada. Por ora, qualquer provider sem chave cai no mock.
  return new MockLLMProvider();
}

export const llmProvider: LLMProvider = createLLMProvider();
export type { LLMProvider } from './LLMProvider.js';
