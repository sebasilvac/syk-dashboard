import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AuthError } from '@supabase/supabase-js';
import type { User, Role } from '@/types/models';
import type { SupabaseAuthState, SupabaseAuthContextValue, AuthContextValue } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/lib/AuthContext';

export const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

function sanitizeAuthError(error: AuthError): string {
  if (error.message.includes('Invalid login credentials')) {
    return 'Credenciales inválidas. Verifica tu email y contraseña.';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Tu cuenta no ha sido confirmada. Revisa tu email.';
  }
  return 'Error de autenticación. Intenta de nuevo.';
}

function mapSupabaseUser(supabaseUser: { id: string; user_metadata: Record<string, unknown> }): User {
  const role = (supabaseUser.user_metadata?.role as Role) ?? 'vendedor';
  const name = (supabaseUser.user_metadata?.name as string) ?? supabaseUser.user_metadata?.email as string ?? '';
  return {
    id: supabaseUser.id,
    name,
    role,
  };
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SupabaseAuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({
          user: mapSupabaseUser(session.user),
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setState({
            user: mapSupabaseUser(session.user),
            isAuthenticated: true,
            loading: false,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: sanitizeAuthError(error) };
    }
    // Update state immediately so the redirect triggers without waiting for the listener
    if (data.user) {
      setState({
        user: mapSupabaseUser(data.user),
        isAuthenticated: true,
        loading: false,
      });
    }
    return { error: null };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState({ user: null, isAuthenticated: false, loading: false });
    await supabase.auth.signOut();
  }, []);

  const value: SupabaseAuthContextValue = { state, login, logout };

  // Also provide the generic AuthContext so useAuth() works app-wide
  const genericAuthValue: AuthContextValue = {
    state: { user: state.user, isAuthenticated: state.isAuthenticated, loading: state.loading },
    login: (_role: Role) => { /* no-op in Supabase mode, use email/password login */ },
    logout: () => { logout(); },
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      <AuthContext.Provider value={genericAuthValue}>
        {children}
      </AuthContext.Provider>
    </SupabaseAuthContext.Provider>
  );
}

export { sanitizeAuthError, mapSupabaseUser };
