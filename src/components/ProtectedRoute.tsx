import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/models';

export type RouteAccessResult = 'allowed' | 'redirect-to-login' | 'access-denied';

export function determineRouteAccess(
  isAuthenticated: boolean,
  userRole: Role | null,
  allowedRoles?: Role[]
): RouteAccessResult {
  if (!isAuthenticated) {
    return 'redirect-to-login';
  }
  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      return 'access-denied';
    }
  }
  return 'allowed';
}

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { state } = useAuth();
  const result = determineRouteAccess(
    state.isAuthenticated,
    state.user?.role ?? null,
    allowedRoles
  );

  if (result === 'redirect-to-login') {
    return <Navigate to="/login" replace />;
  }

  if (result === 'access-denied') {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <Outlet />;
}
