import './StatusBadge.css';

type StatusVariant = 'borrador' | 'pendiente' | 'aprobada' | 'rechazada' | 'activo' | 'entregado';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant ?? inferVariant(status);

  return (
    <span className={`status-badge status-badge--${resolvedVariant}`}>
      {status}
    </span>
  );
}

function inferVariant(status: string): StatusVariant {
  const lower = status.toLowerCase();
  if (lower === 'borrador') return 'borrador';
  if (lower === 'pendiente') return 'pendiente';
  if (lower === 'aprobada') return 'aprobada';
  if (lower === 'rechazada') return 'rechazada';
  if (lower === 'activo') return 'activo';
  if (lower === 'entregado') return 'entregado';
  return 'borrador';
}

export type { StatusBadgeProps, StatusVariant };
