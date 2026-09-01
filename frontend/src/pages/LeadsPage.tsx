import { PageHeader, EmptyState } from './_PageShell';

const filters = [
  'Sem site',
  'Com site',
  'Site analisado',
  'Lead quente',
  'Lead médio',
  'Lead frio',
  'Já contatado',
  'Proposta enviada',
  'Cliente',
  'Descartado',
];

export function LeadsPage() {
  // TODO (Fase 2): GET /api/companies com filtros -> substituir EmptyState pela tabela real.
  return (
    <div className="p-8">
      <PageHeader title="Leads" subtitle="Todas as empresas importadas e seu status de qualificação." />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            className="rounded-full border border-ink-700 bg-ink-900 px-3 py-1 text-xs font-medium text-ink-500 hover:border-accent-500 hover:text-white"
          >
            {f}
          </button>
        ))}
      </div>

      <EmptyState
        title="Nenhum lead ainda"
        description="Faça uma pesquisa para importar empresas do Google Places, ou aguarde a Fase 2 do desenvolvimento."
      />
    </div>
  );
}
