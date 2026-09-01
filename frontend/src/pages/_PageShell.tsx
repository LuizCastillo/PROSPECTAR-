export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/50 px-6 py-16 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
    </div>
  );
}
