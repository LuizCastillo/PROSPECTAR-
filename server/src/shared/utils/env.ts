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

  // Gemini gera o protótipo (HTML/CSS estático) a partir dos dados da
  // empresa + identidade visual + especificações do cliente.
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_URL: z.string().url().default('https://generativelanguage.googleapis.com'),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.0-flash'),

  // Groq recebe o protótipo aprovado + informações adicionais e gera o
  // projeto completo (frontend + backend) para download.
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_API_URL: z.string().url().default('https://api.groq.com/openai/v1'),
  GROQ_MODEL: z.string().min(1).default('llama-3.3-70b-versatile'),

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
  gemini: Boolean(env.GEMINI_API_KEY),
  groq: Boolean(env.GROQ_API_KEY),
  resend: Boolean(env.RESEND_API_KEY),
};
