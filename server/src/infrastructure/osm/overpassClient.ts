import { env } from '@shared/utils/env.js';
import { AppError } from '@shared/errors/AppError.js';

// Elementos crus retornados pela Overpass API. `tags` é o dicionário livre
// do OSM — nada aqui é garantido presente, por isso tudo opcional.
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const REQUEST_TIMEOUT_MS = 25_000;

// Único ponto do sistema que fala com a Overpass API — a URL nunca deve
// aparecer hardcoded em outro arquivo. Trocar de instância pública (ou
// apontar para uma própria) é só mudar OVERPASS_API_URL no .env.
export async function runOverpassQuery(query: string): Promise<OverpassElement[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(env.OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': env.OSM_USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.externalApi('Overpass API demorou demais para responder (timeout).');
    }
    throw AppError.externalApi('Overpass API indisponível no momento.', { cause: String(err) });
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    throw new AppError('RATE_LIMITED', 'Overpass API com rate limit atingido. Tente novamente em instantes.', 429);
  }

  if (!res.ok) {
    throw AppError.externalApi(`Overpass API retornou status ${res.status}.`);
  }

  let data: OverpassResponse;
  try {
    data = (await res.json()) as OverpassResponse;
  } catch {
    throw AppError.externalApi('Resposta inválida da Overpass API (JSON malformado).');
  }

  return data.elements ?? [];
}
