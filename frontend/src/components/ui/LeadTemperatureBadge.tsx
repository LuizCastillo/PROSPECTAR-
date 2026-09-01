import clsx from 'clsx';

type Temperature = 'VERY_HOT' | 'HOT' | 'WARM' | 'COLD';

const styles: Record<Temperature, string> = {
  VERY_HOT: 'bg-hot/15 text-hot border-hot/30',
  HOT: 'bg-hot/10 text-hot/90 border-hot/20',
  WARM: 'bg-warm/15 text-warm border-warm/30',
  COLD: 'bg-cold/15 text-cold border-cold/30',
};

const labels: Record<Temperature, string> = {
  VERY_HOT: 'Muito quente',
  HOT: 'Quente',
  WARM: 'Morno',
  COLD: 'Frio',
};

export function LeadTemperatureBadge({ temperature }: { temperature: Temperature }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[temperature],
      )}
    >
      {labels[temperature]}
    </span>
  );
}
