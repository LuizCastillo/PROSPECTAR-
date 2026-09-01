import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader, EmptyState } from '../_PageShell';

const tabs = [
  'Overview',
  'Business',
  'Digital Presence',
  'Brand',
  'Analysis',
  'Lead Score',
  'Strategy',
  'Prompts',
  'CRM',
  'History',
];

export function CompanyDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // TODO (Fase 2+): GET /api/companies/:id agregando todas as tabelas relacionadas.

  return (
    <div className="p-8">
      <PageHeader title={`Empresa ${id ?? ''}`} subtitle="Dados completos, análise e estratégia." />

      <div className="mb-6 flex flex-wrap gap-1 border-b border-ink-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              tab === activeTab
                ? 'border-b-2 border-accent-500 px-3 py-2 text-sm font-medium text-white'
                : 'px-3 py-2 text-sm font-medium text-ink-500 hover:text-white'
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <EmptyState
        title={`${activeTab} indisponível`}
        description="Esta aba será preenchida com dados reais nas próximas fases do pipeline."
      />
    </div>
  );
}
