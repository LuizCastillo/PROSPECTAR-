import { useState } from 'react';
import { PageHeader } from './_PageShell';

export function SearchPage() {
  const [segment, setSegment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [maxResults, setMaxResults] = useState(20);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // TODO (Fase 2): POST /api/places/search { segment, city, state, maxResults }
    // Cada chamada real ao Google Places consome cota — mostrar isso ao usuário
    // antes de disparar a busca (seção 52 da spec).
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Nova pesquisa"
        subtitle="Encontre empresas por segmento e localização via Google Places."
      />
      <form
        onSubmit={handleSearch}
        className="grid max-w-2xl grid-cols-2 gap-4 rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card"
      >
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-500">Segmento</label>
          <input
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Ex: barbearias"
            className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Cidade</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Pesquisar
          </button>
          <p className="mt-2 text-xs text-ink-500">
            Busca real via Google Places será habilitada quando GOOGLE_MAPS_API_KEY for configurada.
          </p>
        </div>
      </form>
    </div>
  );
}
