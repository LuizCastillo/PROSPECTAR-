import { PageHeader } from './_PageShell';

export function SettingsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Configurações" subtitle="Conta, integrações e preferências." />
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card">
        <p className="text-sm text-ink-500">
          Status das integrações (Google Maps, LLM) será exibido aqui, refletindo{' '}
          <code className="rounded bg-ink-800 px-1 py-0.5 text-xs">GET /health</code> do backend.
        </p>
      </div>
    </div>
  );
}
