import type { ReactNode } from 'react';
import { SupabaseAuthProvider } from '@/lib/SupabaseAuthContext';
import { AuthProvider as MockAuthProvider } from '@/lib/AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  if (isSupabaseConfigured) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
}
