// O OSM não tem uma única chave "categoria" — usa várias (amenity, shop,
// healthcare, office, leisure...). Cada segmento de busca mapeia para uma ou
// mais combinações chave=valor. Isso é aproximado por natureza: o OSM é
// mantido por voluntários e a categorização varia. Quando o segmento digitado
// não bate com nada conhecido, caímos num fallback textual (seção "fallback").
export interface OsmTagFilter {
  key: string;
  value: string;
}

const SEGMENT_MAP: Record<string, OsmTagFilter[]> = {
  'oficina mecânica': [{ key: 'shop', value: 'car_repair' }],
  'oficina': [{ key: 'shop', value: 'car_repair' }],
  'mecânica': [{ key: 'shop', value: 'car_repair' }],
  'restaurante': [{ key: 'amenity', value: 'restaurant' }],
  'dentista': [{ key: 'amenity', value: 'dentist' }],
  'clínica': [{ key: 'amenity', value: 'clinic' }],
  'academia': [{ key: 'leisure', value: 'fitness_centre' }],
  'loja': [{ key: 'shop', value: 'yes' }],
  'salão de beleza': [{ key: 'shop', value: 'hairdresser' }],
  'salão': [{ key: 'shop', value: 'hairdresser' }],
  'barbearia': [{ key: 'shop', value: 'hairdresser' }],
  'padaria': [{ key: 'shop', value: 'bakery' }],
  'pizzaria': [{ key: 'amenity', value: 'restaurant' }],
  'farmácia': [{ key: 'amenity', value: 'pharmacy' }],
  'pet shop': [{ key: 'shop', value: 'pet' }],
  'imobiliária': [{ key: 'office', value: 'estate_agent' }],
  'advocacia': [{ key: 'office', value: 'lawyer' }],
  'contabilidade': [{ key: 'office', value: 'accountant' }],
  'hotel': [{ key: 'tourism', value: 'hotel' }],
  'supermercado': [{ key: 'shop', value: 'supermarket' }],
};

export function resolveSegmentTags(segment: string): OsmTagFilter[] {
  const normalized = segment.trim().toLowerCase();
  if (SEGMENT_MAP[normalized]) return SEGMENT_MAP[normalized];

  // Fallback: tenta achar por substring (ex: "oficinas" bate em "oficina")
  const match = Object.keys(SEGMENT_MAP).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? SEGMENT_MAP[match] : [];
}

export function knownSegments(): string[] {
  return Object.keys(SEGMENT_MAP);
}
