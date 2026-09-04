import { PageHeader } from './_PageShell';

const secondaryMetrics = [
  { label: 'Leads quentes', value: '—' },
  { label: 'Sem site', value: '—' },
  { label: 'Sites analisados', value: '—' },
  { label: 'Prompts gerados', value: '—' },
  { label: 'Contatados', value: '—' },
  { label: 'Propostas', value: '—' },
  { label: 'Clientes', value: '—' },
];

export function DashboardPage() {
  return (
    <div className="p-5 md:p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua prospecção. Conecte o backend para ver dados reais."
      />

      {/* Métrica principal — o elemento com destaque, único ponto de ousadia da página */}
      <div className="mb-4 rounded-2xl border border-ink-700 bg-gradient-to-br from-ink-900 to-ink-850 p-6 shadow-card md:p-8">
        <p className="text-sm font-medium text-ink-400">Total de empresas cadastradas</p>
        <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-paper md:text-6xl">—</p>
      </div>

      {/* Métricas secundárias — faixa horizontal com scroll no mobile, sem quebra de linha */}
      <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900/60">
        <div className="flex min-w-max divide-x divide-ink-700">
          {secondaryMetrics.map((m) => (
            <div key={m.label} className="w-32 shrink-0 px-5 py-4 sm:w-40">
              <p className="text-xs text-ink-400">{m.label}</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-paper">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
