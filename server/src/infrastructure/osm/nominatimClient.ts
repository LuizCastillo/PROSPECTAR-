import { env } from '@shared/utils/env.js';
import { AppError } from '@shared/errors/AppError.js';
import { TtlCache } from '@shared/utils/TtlCache.js';

export interface GeocodedLocation {
  lat: number;
  lon: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const REQUEST_TIMEOUT_MS = 15_000;

// Nominatim pede uso comedido (1 req/s, User-Agent identificado). Cache de 24h
// evita bater na API pra geocodificar a mesma cidade/estado repetidamente.
const geocodeCache = new TtlCache<GeocodedLocation | null>(24 * 60 * 60 * 1000);

export async function geocodeLocation(query: string): Promise<GeocodedLocation | null> {
  const cacheKey = query.trim().toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const url = new URL(`${env.NOMINATIM_URL}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': env.OSM_USER_AGENT },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.externalApi('Nominatim demorou demais para responder (timeout).');
    }
    throw AppError.externalApi('Nominatim indisponível no momento.', { cause: String(err) });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw AppError.externalApi(`Nominatim retornou status ${res.status}.`);
  }

  const results = (await res.json()) as NominatimResult[];
  if (results.length === 0) {
    geocodeCache.set(cacheKey, null);
    return null;
  }

  const location: GeocodedLocation = {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    displayName: results[0].display_name,
  };
  geocodeCache.set(cacheKey, location);
  return location;
}
