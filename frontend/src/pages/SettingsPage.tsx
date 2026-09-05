import { PageHeader } from './_PageShell';

export function SettingsPage() {
  return (
    <div className="p-5 md:p-8">
      <PageHeader title="Configurações" subtitle="Conta, integrações e preferências." />
      <div className="rounded-xl border border-slate-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-card-light dark:shadow-card">
        <p className="text-sm text-slate-500 dark:text-ink-400">
          Status da integração de LLM será exibido aqui, refletindo{' '}
          <code className="rounded bg-slate-100 dark:bg-ink-800 px-1 py-0.5 text-xs">GET /health</code> do backend.
        </p>
      </div>
    </div>
  );
}
