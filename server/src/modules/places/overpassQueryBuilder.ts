import type { OsmTagFilter } from './segmentTagMap.js';

export interface BuildQueryParams {
  tags: OsmTagFilter[];
  lat: number;
  lon: number;
  radiusMeters: number;
  freeTextName?: string;
  maxResults: number;
}

// Monta uma query Overpass QL a partir de filtros já resolvidos. Usa `nwr`
// (node, way, relation) porque estabelecimentos podem ser mapeados como
// qualquer um dos três no OSM (um shopping é `way`, uma barbearia geralmente
// é `node`). `out center` traz o centro geométrico para ways/relations, que
// não têm lat/lon diretos como um node.
export function buildOverpassQuery({
  tags,
  lat,
  lon,
  radiusMeters,
  freeTextName,
  maxResults,
}: BuildQueryParams): string {
  // Limite defensivo — nunca deixar o raio virar uma consulta gigante e cara
  // pro servidor público da Overpass.
  const radius = Math.min(Math.max(radiusMeters, 100), 20_000);
  const around = `(around:${radius},${lat},${lon})`;

  const clauses =
    tags.length > 0
      ? tags.map((t) => `nwr["${t.key}"="${t.value}"]${around};`).join('\n  ')
      : freeTextName
        ? `nwr["name"~"${escapeRegex(freeTextName)}",i]${around};`
        : `nwr["shop"]${around};\n  nwr["amenity"]${around};\n  nwr["office"]${around};`;

  return `
[out:json][timeout:20];
(
  ${clauses}
);
out center ${maxResults};
`.trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
