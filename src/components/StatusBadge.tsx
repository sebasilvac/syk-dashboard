export type StatusType = 'active' | 'pending' | 'completed' | 'critical';

export interface StatusBadgeProps {
  status: StatusType | string;
  children?: React.ReactNode;
}

const statusClasses: Record<StatusType, string> = {
  active: 'bg-success-muted text-success',
  pending: 'bg-warning-muted text-warning',
  completed: 'bg-secondary/30 text-text-muted',
  critical: 'bg-destructive-muted text-destructive',
};

/**
 * Maps legacy Spanish status values to the new StatusType.
 * This ensures backward compatibility until all pages are migrated.
 */
function resolveStatus(status: string): StatusType {
  switch (status) {
    case 'aprobada':
    case 'activo':
      return 'active';
    case 'pendiente':
      return 'pending';
    case 'entregado':
    case 'borrador':
      return 'completed';
    case 'rechazada':
      return 'critical';
    default:
      if (status in statusClasses) return status as StatusType;
      return 'completed';
  }
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const resolved = resolveStatus(status);
  const colorClasses = statusClasses[resolved];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {children ?? status}
    </span>
  );
}
