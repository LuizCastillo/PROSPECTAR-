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
  'auto center': [{ key: 'shop', value: 'car_repair' }],
  'restaurante': [{ key: 'amenity', value: 'restaurant' }],
  'lanchonete': [{ key: 'amenity', value: 'fast_food' }],
  'fast food': [{ key: 'amenity', value: 'fast_food' }],
  'café': [{ key: 'amenity', value: 'cafe' }],
  'cafeteria': [{ key: 'amenity', value: 'cafe' }],
  'bar': [{ key: 'amenity', value: 'bar' }],
  'dentista': [{ key: 'amenity', value: 'dentist' }],
  'odontologia': [{ key: 'amenity', value: 'dentist' }],
  'clínica': [{ key: 'amenity', value: 'clinic' }],
  'clínica médica': [{ key: 'amenity', value: 'clinic' }],
  'hospital': [{ key: 'amenity', value: 'hospital' }],
  'veterinária': [{ key: 'amenity', value: 'veterinary' }],
  'veterinário': [{ key: 'amenity', value: 'veterinary' }],
  'academia': [{ key: 'leisure', value: 'fitness_centre' }],
  'crossfit': [{ key: 'leisure', value: 'fitness_centre' }],
  'loja': [{ key: 'shop', value: 'yes' }],
  'salão de beleza': [{ key: 'shop', value: 'hairdresser' }],
  'salão': [{ key: 'shop', value: 'hairdresser' }],
  'barbearia': [{ key: 'shop', value: 'hairdresser' }],
  'manicure': [{ key: 'shop', value: 'beauty' }],
  'estética': [{ key: 'shop', value: 'beauty' }],
  'padaria': [{ key: 'shop', value: 'bakery' }],
  'confeitaria': [{ key: 'shop', value: 'bakery' }],
  'pizzaria': [{ key: 'amenity', value: 'restaurant' }],
  'farmácia': [{ key: 'amenity', value: 'pharmacy' }],
  'drogaria': [{ key: 'amenity', value: 'pharmacy' }],
  'pet shop': [{ key: 'shop', value: 'pet' }],
  'petshop': [{ key: 'shop', value: 'pet' }],
  'imobiliária': [{ key: 'office', value: 'estate_agent' }],
  'advocacia': [{ key: 'office', value: 'lawyer' }],
  'escritório de advocacia': [{ key: 'office', value: 'lawyer' }],
  'contabilidade': [{ key: 'office', value: 'accountant' }],
  'contador': [{ key: 'office', value: 'accountant' }],
  'hotel': [{ key: 'tourism', value: 'hotel' }],
  'pousada': [{ key: 'tourism', value: 'guest_house' }],
  'supermercado': [{ key: 'shop', value: 'supermarket' }],
  'mercado': [{ key: 'shop', value: 'supermarket' }],
  'loja de roupas': [{ key: 'shop', value: 'clothes' }],
  'boutique': [{ key: 'shop', value: 'clothes' }],
  'ótica': [{ key: 'shop', value: 'optician' }],
  'joalheria': [{ key: 'shop', value: 'jewelry' }],
  'lavanderia': [{ key: 'shop', value: 'laundry' }],
  'auto peças': [{ key: 'shop', value: 'car_parts' }],
  'concessionária': [{ key: 'shop', value: 'car' }],
  'posto de gasolina': [{ key: 'amenity', value: 'fuel' }],
  'posto': [{ key: 'amenity', value: 'fuel' }],
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
