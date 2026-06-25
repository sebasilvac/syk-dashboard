import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '@/types/models';
import type { AuthState, AuthContextValue } from '@/types/auth';
import { mockUsers } from '@/lib/mockData';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
  });

  const login = useCallback((role: Role) => {
    const user = mockUsers.find((u) => u.role === role) ?? null;
    if (user) {
      setState({ user, isAuthenticated: true, loading: false });
    }
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, loading: false });
  }, []);

  const value: AuthContextValue = { state, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
