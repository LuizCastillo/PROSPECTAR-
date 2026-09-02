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

  // Busca de empresas via OpenStreetMap — sem custo, sem API key.
  // URLs configuráveis para permitir trocar de instância pública (rate limits
  // variam por provedor) ou apontar para uma instância própria no futuro.
  OVERPASS_API_URL: z.string().url().default('https://overpass-api.de/api/interpreter'),
  NOMINATIM_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  // Nominatim exige um identificador de app no User-Agent (política de uso).
  OSM_USER_AGENT: z.string().min(1).default('LeadForge/1.0 (contato: nao-configurado@leadforge.local)'),

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
  osm: true, // OSM/Overpass/Nominatim são públicos, sem key — sempre "disponível"
  llm: Boolean(env.LLM_API_KEY) && env.LLM_PROVIDER !== 'mock',
  resend: Boolean(env.RESEND_API_KEY),
};
