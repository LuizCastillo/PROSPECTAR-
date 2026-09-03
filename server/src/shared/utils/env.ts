import 'dotenv/config';
import { z } from 'zod';

// Todas as variáveis de ambiente do backend passam por aqui.
// Nunca ler process.env diretamente em outros módulos — sempre importar `env`.
// Chaves ausentes (LLM) ficam undefined de propósito: os módulos que dependem
// delas devem checar e retornar UNKNOWN/erro claro, nunca inventar dado.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().optional(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  LLM_PROVIDER: z.enum(['anthropic', 'openai', 'mock']).default('mock'),
  LLM_API_KEY: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Falha rápido e claro na inicialização em vez de quebrar silenciosamente depois.
  console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida. Verifique o .env.');
}

export const env = parsed.data;

export const integrationStatus = {
  llm: Boolean(env.LLM_API_KEY) && env.LLM_PROVIDER !== 'mock',
  resend: Boolean(env.RESEND_API_KEY),
};
