import { PageHeader } from './_PageShell';

const metrics = [
  { label: 'Total de empresas', value: '—' },
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
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua prospecção. Conecte o backend para ver dados reais."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
            <p className="text-xs font-medium text-ink-500">{m.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
