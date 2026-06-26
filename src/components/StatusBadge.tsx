import { Badge } from '@/design-system/components/Badge';
import type { BadgeVariant } from '@/design-system/variants/badge';

export type StatusType = 'active' | 'pending' | 'completed' | 'critical';

export interface StatusBadgeProps {
  status: StatusType | string;
  children?: React.ReactNode;
}

const statusToVariant: Record<StatusType, BadgeVariant> = {
  active: 'success',
  pending: 'warning',
  completed: 'default',
  critical: 'destructive',
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
      return 'completed';
    case 'rechazada':
      return 'critical';
    default:
      if (status in statusToVariant) return status as StatusType;
      return 'completed';
  }
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const resolved = resolveStatus(status);
  const variant = statusToVariant[resolved];

  return (
    <Badge variant={variant} size="sm">
      {children ?? status}
    </Badge>
  );
}
