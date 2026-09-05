export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-paper md:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-ink-400">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-ink-700 bg-slate-100/40 dark:bg-ink-900/40 px-6 py-14 text-center md:py-16">
      <p className="font-display text-sm font-medium text-slate-900 dark:text-paper">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-ink-400">{description}</p>
    </div>
  );
}
