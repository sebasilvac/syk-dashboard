import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'destructive';
}

const iconBgMap: Record<NonNullable<MetricCardProps['variant']>, string> = {
  default: 'bg-secondary/20',
  accent: 'bg-accent/20',
  warning: 'bg-warning/20',
  destructive: 'bg-destructive/20',
};

export function MetricCard({ title, value, icon, variant = 'default' }: MetricCardProps) {
  return (
    <article className="bg-surface rounded-2xl shadow-soft p-5 hover:-translate-y-0.5 hover:shadow-elevated transition-all duration-200 flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${iconBgMap[variant]}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-text-muted text-sm font-medium">{title}</h3>
        <p className="text-text-primary font-bold text-2xl" data-tabular>
          {value}
        </p>
      </div>
    </article>
  );
}

export type { MetricCardProps };
