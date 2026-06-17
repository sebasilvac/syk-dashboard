import { diffDays } from '@/lib/computeAlerts';
import './DueDateIndicator.css';

interface DueDateIndicatorProps {
  dueDate: string;
  today?: Date;
}

export type DueDateLevel = 'warning' | 'critical' | 'none';

/**
 * Compute the indicator level for a due date.
 * - critical: today > dueDate (overdue)
 * - warning: 0 < daysUntilDue <= 2
 * - none: daysUntilDue > 2
 */
export function computeDueDateLevel(dueDate: string, today: Date): DueDateLevel {
  const days = diffDays(new Date(dueDate), today);
  if (days <= 0) return 'critical';
  if (days <= 2) return 'warning';
  return 'none';
}

export function DueDateIndicator({ dueDate, today = new Date() }: DueDateIndicatorProps) {
  const level = computeDueDateLevel(dueDate, today);

  if (level === 'none') return null;

  return (
    <span
      className={`due-date-indicator due-date-indicator--${level}`}
      aria-label={level === 'critical' ? 'Pedido atrasado' : 'Pedido por vencer'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

export type { DueDateIndicatorProps };
