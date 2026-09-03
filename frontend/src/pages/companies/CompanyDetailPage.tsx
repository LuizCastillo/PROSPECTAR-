import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader, EmptyState } from '../_PageShell';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  client_specifications: string | null;
  brand: {
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
  } | null;
}

interface Mockup {
  id: string;
  version: number;
  generated_at: string;
}

const tabs = [
  'Overview',
  'Business',
  'Digital Presence',
  'Brand',
  'Analysis',
  'Lead Score',
  'Strategy',
  'Prompts',
  'Protótipo',
  'CRM',
  'History',
];

export function CompanyDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockupLoading, setMockupLoading] = useState(false);
  const [mockup, setMockup] = useState<Mockup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<Company>(`/api/companies/${id}`)
      .then(setCompany)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar empresa.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerateMockup() {
    if (!id) return;
    setMockupLoading(true);
    setError(null);
    try {
      const result = await api.post<Mockup>(`/api/companies/${id}/mockup`);
      setMockup(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar protótipo.');
    } finally {
      setMockupLoading(false);
    }
  }

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000';
  const mockupUrl = mockup ? `${apiBase}/api/companies/${id}/mockup/raw?version=${mockup.version}` : null;

  return (
    <div className="p-8">
      <PageHeader
        title={loading ? 'Carregando...' : (company?.name ?? `Empresa ${id ?? ''}`)}
        subtitle="Dados completos, análise e estratégia."
      />

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

      {error && (
        <div className="mb-4 rounded-lg border border-hot/30 bg-hot/10 px-4 py-3 text-sm text-hot">{error}</div>
      )}

      {activeTab === 'Overview' && company && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
            <p className="text-xs text-ink-500">Categoria</p>
            <p className="text-sm text-white">{company.category ?? 'não informado'}</p>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
            <p className="text-xs text-ink-500">Telefone</p>
            <p className="text-sm text-white">{company.phone ?? 'não informado'}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
            <p className="text-xs text-ink-500">Endereço</p>
            <p className="text-sm text-white">
              {[company.address, company.city, company.state].filter(Boolean).join(', ') || 'não informado'}
            </p>
          </div>
          {company.brand && (
            <div className="col-span-2 rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
              <p className="mb-2 text-xs text-ink-500">Identidade visual</p>
              <div className="flex gap-3">
                {[company.brand.primary_color, company.brand.secondary_color, company.brand.accent_color]
                  .filter(Boolean)
                  .map((color) => (
                    <div key={color} className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 rounded-full border border-ink-700"
                        style={{ backgroundColor: color ?? undefined }}
                      />
                      <span className="text-xs text-ink-500">{color}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {company.client_specifications && (
            <div className="col-span-2 rounded-xl border border-ink-800 bg-ink-900 p-4 shadow-card">
              <p className="mb-1 text-xs text-ink-500">Especificações do cliente</p>
              <p className="whitespace-pre-wrap text-sm text-white">{company.client_specifications}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Protótipo' && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card">
          <p className="mb-4 text-sm text-ink-500">
            Gera um protótipo estático (HTML) do site a partir dos dados e especificações cadastrados, pronto
            para enviar o link ao cliente antes de iniciar o desenvolvimento real.
          </p>
          <button
            onClick={handleGenerateMockup}
            disabled={mockupLoading}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {mockupLoading ? 'Gerando...' : 'Gerar protótipo'}
          </button>
          {mockupUrl && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-ink-500">
                Versão {mockup?.version} — link para enviar ao cliente:
              </p>
              <a
                href={mockupUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent-400 underline break-all"
              >
                {mockupUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'Overview' && activeTab !== 'Protótipo' && (
        <EmptyState
          title={`${activeTab} indisponível`}
          description="Esta aba será preenchida com dados reais nas próximas fases do pipeline."
        />
      )}
    </div>
  );
}
