import { env } from '@shared/utils/env.js';
import { AppError } from '@shared/errors/AppError.js';

const REQUEST_TIMEOUT_MS = 60_000;

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

// Único ponto do sistema que fala com a Groq API (compatível com o formato
// de chat completions da OpenAI). Usada especificamente para gerar o
// projeto completo (frontend + backend) a partir do protótipo já aprovado.
export async function generateWithGroq(prompt: string): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw AppError.llm('GROQ_API_KEY não configurada — não é possível gerar o site completo.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${env.GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.llm('Groq demorou demais para responder (timeout).');
    }
    throw AppError.llm('Groq indisponível no momento.', { cause: String(err) });
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    throw new AppError('RATE_LIMITED', 'Groq com rate limit atingido. Tente novamente em instantes.', 429);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw AppError.llm(`Groq retornou status ${res.status}.`, { body: body.slice(0, 500) });
  }

  const data = (await res.json()) as GroqChatResponse;
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw AppError.llmInvalidResponse('Groq retornou uma resposta vazia ou em formato inesperado.', data);
  }

  return text;
}
