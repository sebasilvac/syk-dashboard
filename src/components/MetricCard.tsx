import type { ReactNode } from 'react';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'destructive';
}

export function MetricCard({ title, value, icon, variant = 'default' }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${variant}`}>
      <div className="metric-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="metric-card__content">
        <h3 className="metric-card__title">{title}</h3>
        <p className="metric-card__value" data-tabular>
          {value}
        </p>
      </div>
    </article>
  );
}

export type { MetricCardProps };
