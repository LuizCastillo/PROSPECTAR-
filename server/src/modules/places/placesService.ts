import { geocodeLocation } from '@infrastructure/osm/nominatimClient.js';
import { runOverpassQuery } from '@infrastructure/osm/overpassClient.js';
import { AppError } from '@shared/errors/AppError.js';
import { TtlCache } from '@shared/utils/TtlCache.js';
import { resolveSegmentTags } from './segmentTagMap.js';
import { buildOverpassQuery } from './overpassQueryBuilder.js';
import { normalizeOverpassElement, type NormalizedPlace } from './normalizePlace.js';

export interface SearchPlacesInput {
  segment: string;
  city: string;
  state?: string;
  country?: string;
  radiusMeters?: number;
  maxResults?: number;
}

export interface SearchPlacesResult {
  query: SearchPlacesInput;
  resolvedLocation: { lat: number; lon: number; displayName: string };
  results: NormalizedPlace[];
  cached: boolean;
}

const DEFAULT_RADIUS_METERS = 5_000;
const DEFAULT_MAX_RESULTS = 30;
const HARD_MAX_RESULTS = 100;

// Cache de 15min por combinação de busca — evita bater no Overpass público
// repetidamente para a mesma pesquisa em pouco tempo (seção 28/52 da spec).
const searchCache = new TtlCache<SearchPlacesResult>(15 * 60 * 1000);

export async function searchPlaces(input: SearchPlacesInput): Promise<SearchPlacesResult> {
  const maxResults = Math.min(input.maxResults ?? DEFAULT_MAX_RESULTS, HARD_MAX_RESULTS);
  const radiusMeters = input.radiusMeters ?? DEFAULT_RADIUS_METERS;

  const locationQuery = [input.city, input.state, input.country].filter(Boolean).join(', ');
  const cacheKey = JSON.stringify({ ...input, maxResults, radiusMeters, locationQuery });

  const cached = searchCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  const geocoded = await geocodeLocation(locationQuery);
  if (!geocoded) {
    throw AppError.validation(`Não foi possível localizar "${locationQuery}" no OpenStreetMap.`);
  }

  const tags = resolveSegmentTags(input.segment);
  const overpassQuery = buildOverpassQuery({
    tags,
    lat: geocoded.lat,
    lon: geocoded.lon,
    radiusMeters,
    freeTextName: tags.length === 0 ? input.segment : undefined,
    maxResults,
  });

  const elements = await runOverpassQuery(overpassQuery);
  const results = elements
    .map(normalizeOverpassElement)
    .filter((p): p is NormalizedPlace => p !== null);

  const result: SearchPlacesResult = {
    query: { ...input, radiusMeters, maxResults },
    resolvedLocation: geocoded,
    results,
    cached: false,
  };

  searchCache.set(cacheKey, result);
  return result;
}
