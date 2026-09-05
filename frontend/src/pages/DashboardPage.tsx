import { useEffect, useState } from 'react';
import { PageHeader } from './_PageShell';
import { api } from '@/lib/api';

interface Company {
  id: string;
  pipeline_status: string;
}

const secondaryMetricLabels = [
  'Leads quentes',
  'Sem site',
  'Sites analisados',
  'Prompts gerados',
  'Contatados',
  'Propostas',
  'Clientes',
];

export function DashboardPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Company[]>('/api/companies')
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const total = companies?.length ?? 0;

  return (
    <div className="p-5 md:p-8">
      <PageHeader title="Dashboard" subtitle="Visão geral da sua prospecção." />

      {/* Métrica principal — o elemento com destaque, único ponto de ousadia da página */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-card-light dark:border-ink-700 dark:from-ink-900 dark:to-ink-850 dark:shadow-card md:p-8">
        <p className="text-sm font-medium text-slate-500 dark:text-ink-400">Total de empresas cadastradas</p>
        {loading ? (
          <div className="mt-3 h-12 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-ink-800 md:h-14" />
        ) : (
          <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-slate-900 dark:text-paper md:text-6xl">
            {total}
          </p>
        )}
      </div>

      {/* Métricas secundárias — faixa horizontal com scroll no mobile, sem quebra de linha.
          Ainda não calculadas no backend (Fase 3+); mostram "—" pequeno, não como número. */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/60 dark:border-ink-700 dark:bg-ink-900/60">
        <div className="flex min-w-max divide-x divide-slate-200 dark:divide-ink-700">
          {secondaryMetricLabels.map((label) => (
            <div key={label} className="w-32 shrink-0 px-5 py-4 sm:w-40">
              <p className="text-xs text-slate-500 dark:text-ink-400">{label}</p>
              <p className="mt-1.5 font-display text-sm font-medium text-slate-400 dark:text-ink-500">
                ainda não calculado
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
