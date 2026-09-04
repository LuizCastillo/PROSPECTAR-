import { env } from '@shared/utils/env.js';
import { AppError } from '@shared/errors/AppError.js';

const REQUEST_TIMEOUT_MS = 45_000;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
}

// Único ponto do sistema que fala com a Gemini API. Usada especificamente
// para gerar o protótipo (HTML/CSS estático) — a etapa "rápida e visual"
// antes do cliente aprovar o projeto de verdade.
export async function generateWithGemini(prompt: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw AppError.llm('GEMINI_API_KEY não configurada — não é possível gerar o protótipo.');
  }

  const url = `${env.GEMINI_API_URL}/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.llm('Gemini demorou demais para responder (timeout).');
    }
    throw AppError.llm('Gemini indisponível no momento.', { cause: String(err) });
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    throw new AppError('RATE_LIMITED', 'Gemini com rate limit atingido. Tente novamente em instantes.', 429);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw AppError.llm(`Gemini retornou status ${res.status}.`, { body: body.slice(0, 500) });
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');

  if (!text) {
    throw AppError.llmInvalidResponse('Gemini retornou uma resposta vazia ou em formato inesperado.', data);
  }

  return text;
}
