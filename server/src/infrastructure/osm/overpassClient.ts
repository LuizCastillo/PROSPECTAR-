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

// Timeout do nosso lado fica acima do [timeout:25] embutido na própria query
// (overpassQueryBuilder.ts) — assim, na maioria dos casos, é o Overpass quem
// desiste primeiro e devolve um erro estruturado, em vez do nosso
// AbortController cortar a conexão sem explicação nenhuma.
const REQUEST_TIMEOUT_MS = 32_000;

// Instância configurada via OVERPASS_API_URL é sempre a primeira tentativa.
// Estas são fallbacks fixos, usados só se a primeira falhar (timeout, rede,
// 5xx) — centralizados aqui, únicas URLs de Overpass hardcoded no projeto.
// Instâncias públicas de Overpass individualmente instáveis/sobrecarregadas
// são comuns; ter mais de uma opção reduz bastante a taxa de falha visível
// pro usuário.
const FALLBACK_OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

async function fetchOverpass(url: string, query: string): Promise<OverpassElement[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': env.OSM_USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    throw new AppError('RATE_LIMITED', 'Overpass API com rate limit atingido. Tente novamente em instantes.', 429);
  }
  if (res.status === 504 || res.status === 502 || res.status === 503) {
    throw AppError.externalApi(`Overpass API sobrecarregada (status ${res.status}).`);
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

// Único ponto do sistema que fala com a Overpass API — a URL primária nunca
// deve aparecer hardcoded em outro arquivo. Trocar de instância principal é
// só mudar OVERPASS_API_URL no .env; os fallbacks entram em ação sozinhos
// se a primária falhar.
export async function runOverpassQuery(query: string): Promise<OverpassElement[]> {
  const urlsToTry = [env.OVERPASS_API_URL, ...FALLBACK_OVERPASS_URLS.filter((u) => u !== env.OVERPASS_API_URL)];

  let lastError: unknown;
  for (const url of urlsToTry) {
    try {
      return await fetchOverpass(url, query);
    } catch (err) {
      lastError = err;
      // RATE_LIMITED e erros de validação não se beneficiam de tentar outra
      // instância com a mesma query; qualquer outra coisa (timeout, rede,
      // 5xx) vale a pena tentar no próximo servidor.
      if (err instanceof AppError && err.code === 'RATE_LIMITED') continue;
      continue;
    }
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw AppError.externalApi(
      'Todas as instâncias da Overpass API demoraram demais para responder (timeout). Tente reduzir o raio ou a quantidade de resultados.',
    );
  }
  if (lastError instanceof AppError) throw lastError;
  throw AppError.externalApi('Overpass API indisponível no momento (todas as instâncias falharam).', {
    cause: String(lastError),
  });
}
