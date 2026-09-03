import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, EmptyState } from './_PageShell';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  pipeline_status: string;
}

export function LeadsPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Company[]>('/api/companies')
      .then(setCompanies)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar empresas.'));
  }, []);

  return (
    <div className="p-8">
      <PageHeader title="Leads" subtitle="Todas as empresas cadastradas manualmente." />

      {error && (
        <div className="mb-4 rounded-lg border border-hot/30 bg-hot/10 px-4 py-3 text-sm text-hot">{error}</div>
      )}

      {companies && companies.length === 0 && (
        <EmptyState
          title="Nenhuma empresa cadastrada ainda"
          description="Cadastre uma empresa manualmente, ou aguarde a Fase 3 do desenvolvimento."
        />
      )}

      {companies && companies.length > 0 && (
        <div className="flex flex-col gap-2">
          {companies.map((c) => (
            <Link
              key={c.id}
              to={`/companies/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card hover:border-accent-500"
            >
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-xs text-ink-500">
                  {c.category ?? 'sem categoria'} · {[c.city, c.state].filter(Boolean).join(', ') || 'sem local'}
                </p>
              </div>
              <span className="rounded-full border border-ink-700 px-2.5 py-0.5 text-xs text-ink-500">
                {c.pipeline_status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
