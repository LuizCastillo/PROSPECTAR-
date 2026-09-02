import { useState } from 'react';
import { PageHeader } from './_PageShell';
import { api } from '@/lib/api';
import { PlacesMap, type MapPlace } from '@/components/map/PlacesMap';

interface NormalizedPlace {
  osmType: string;
  osmId: number;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  source: string;
}

interface SearchResponse {
  resolvedLocation: { lat: number; lon: number; displayName: string };
  results: NormalizedPlace[];
  cached: boolean;
}

export function SearchPage() {
  const [segment, setSegment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [maxResults, setMaxResults] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<SearchResponse>('/api/places/search', {
        segment,
        city,
        state: state || undefined,
        maxResults,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar empresas.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const mapPlaces: MapPlace[] =
    data?.results.map((p) => ({
      id: `${p.osmType}-${p.osmId}`,
      name: p.name,
      category: p.category,
      address: p.address,
      phone: p.phone,
      website: p.website,
      latitude: p.latitude,
      longitude: p.longitude,
    })) ?? [];

  return (
    <div className="p-8">
      <PageHeader
        title="Nova pesquisa"
        subtitle="Encontre empresas por segmento e localização via OpenStreetMap — sem custo, sem API key."
      />

      <form
        onSubmit={handleSearch}
        className="mb-6 grid max-w-2xl grid-cols-2 gap-4 rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card"
      >
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-500">Segmento</label>
          <input
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Ex: barbearia, restaurante, dentista"
            required
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Cidade</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Estado</label>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Quantidade máxima</label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            min={1}
            max={100}
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          />
        </div>
        <div className="col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
          <p className="mt-2 text-xs text-ink-500">
            Dados via OpenStreetMap (Overpass + Nominatim). Cobertura varia por região — nem toda empresa
            tem todos os campos preenchidos no OSM. Segmentos bem específicos ou quantidades grandes podem
            demorar mais (o sistema tenta até 2 instâncias diferentes antes de desistir).
          </p>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-hot/30 bg-hot/10 px-4 py-3 text-sm text-hot">{error}</div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-ink-500">
              {data.results.length} resultado(s) perto de {data.resolvedLocation.displayName}
              {data.cached && ' · resultado em cache'}
            </p>
            <div className="flex flex-col gap-2">
              {data.results.length === 0 && (
                <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/50 px-6 py-10 text-center text-sm text-ink-500">
                  Nenhum estabelecimento encontrado no OpenStreetMap para essa busca.
                </div>
              )}
              {data.results.map((p) => (
                <div key={`${p.osmType}-${p.osmId}`} className="rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-ink-500">{p.category}</p>
                  <div className="mt-2 space-y-0.5 text-xs text-ink-500">
                    <p>Endereço: {p.address === 'UNKNOWN' ? 'não informado no OSM' : p.address}</p>
                    <p>Telefone: {p.phone === 'UNKNOWN' ? 'não informado no OSM' : p.phone}</p>
                    <p>Site: {p.website === 'UNKNOWN' ? 'não informado no OSM' : p.website}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[500px] lg:sticky lg:top-6">
            <PlacesMap center={[data.resolvedLocation.lat, data.resolvedLocation.lon]} places={mapPlaces} />
          </div>
        </div>
      )}
    </div>
  );
}
