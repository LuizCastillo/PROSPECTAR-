import type { OsmTagFilter } from './segmentTagMap.js';

export interface BuildQueryParams {
  tags: OsmTagFilter[];
  lat: number;
  lon: number;
  radiusMeters: number;
  freeTextName?: string;
  maxResults: number;
}

// Tags "guarda-chuva" que cobrem a esmagadora maioria dos estabelecimentos
// comerciais no OSM. Usadas no fallback de texto livre para restringir a
// busca a elementos que já são algum tipo de comércio/serviço, em vez de
// varrer QUALQUER elemento do mapa com nome — isso é o que causava timeout
// em segmentos não mapeados (ex: "estúdio de tatuagem").
const COMMERCIAL_TAG_KEYS = ['shop', 'amenity', 'office', 'craft', 'leisure', 'tourism', 'healthcare'];

// Overpass timeout interno da própria query (servidor derruba a query sozinho
// depois disso). Fica abaixo do timeout do nosso fetch (ver overpassClient.ts)
// pra sempre recebermos uma resposta de erro estruturada do Overpass em vez
// de só estourar o AbortController do nosso lado sem explicação.
const OVERPASS_INTERNAL_TIMEOUT_S = 25;

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
  // pro servidor público da Overpass. Raios grandes em cidades densas são a
  // maior causa de timeout, então o teto é mais conservador que antes.
  const radius = Math.min(Math.max(radiusMeters, 100), 15_000);
  const around = `(around:${radius},${lat},${lon})`;

  let clauses: string;
  if (tags.length > 0) {
    // Segmento conhecido: filtro exato por tag=valor, a consulta mais barata possível.
    clauses = tags.map((t) => `nwr["${t.key}"="${t.value}"]${around};`).join('\n  ');
  } else if (freeTextName) {
    // Segmento sem mapeamento: regex por nome, mas SEMPRE combinado com uma
    // tag comercial — nunca "qualquer elemento com nome" (caro demais).
    const escaped = escapeRegex(freeTextName);
    clauses = COMMERCIAL_TAG_KEYS.map(
      (key) => `nwr["${key}"]["name"~"${escaped}",i]${around};`,
    ).join('\n  ');
  } else {
    clauses = `nwr["shop"]${around};\n  nwr["amenity"]${around};\n  nwr["office"]${around};`;
  }

  return `
[out:json][timeout:${OVERPASS_INTERNAL_TIMEOUT_S}];
(
  ${clauses}
);
out center ${maxResults};
`.trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
