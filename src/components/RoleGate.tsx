import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/models';

interface RoleGateProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback }: RoleGateProps) {
  const { state } = useAuth();

  if (!state.user || !allowedRoles.includes(state.user.role)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

export type { RoleGateProps };
