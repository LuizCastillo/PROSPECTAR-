import type { OverpassElement } from '@infrastructure/osm/overpassClient.js';

// Formato normalizado que o frontend consome — deliberadamente parecido com
// a tabela `companies` do Supabase (mesmos nomes de campo), mas isso ainda
// não é persistido aqui; a importação para o banco é uma etapa separada
// (POST /api/companies/import), para não gravar resultado de toda busca.
export interface NormalizedPlace {
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  name: string;
  category: string | 'UNKNOWN';
  address: string | 'UNKNOWN';
  city: string | 'UNKNOWN';
  state: string | 'UNKNOWN';
  postalCode: string | 'UNKNOWN';
  phone: string | 'UNKNOWN';
  website: string | 'UNKNOWN';
  latitude: number;
  longitude: number;
  source: 'OpenStreetMap';
}

// Nunca inventa dado: campo ausente no OSM vira 'UNKNOWN', nunca string vazia
// silenciosa nem valor inferido.
export function normalizeOverpassElement(el: OverpassElement): NormalizedPlace | null {
  const lat = el.type === 'node' ? el.lat : el.center?.lat;
  const lon = el.type === 'node' ? el.lon : el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const tags = el.tags ?? {};
  const name = tags.name ?? tags['name:pt'];
  if (!name) return null; // sem nome, não é um lead útil — descarta

  const addressParts = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean);

  return {
    osmType: el.type,
    osmId: el.id,
    name,
    category: tags.shop ?? tags.amenity ?? tags.office ?? tags.leisure ?? tags.tourism ?? 'UNKNOWN',
    address: addressParts.length > 0 ? addressParts.join(', ') : 'UNKNOWN',
    city: tags['addr:city'] ?? 'UNKNOWN',
    state: tags['addr:state'] ?? 'UNKNOWN',
    postalCode: tags['addr:postcode'] ?? 'UNKNOWN',
    phone: tags.phone ?? tags['contact:phone'] ?? 'UNKNOWN',
    website: tags.website ?? tags['contact:website'] ?? 'UNKNOWN',
    latitude: lat,
    longitude: lon,
    source: 'OpenStreetMap',
  };
}
