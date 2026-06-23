import type { ReactNode } from 'react';
import { SupabaseDataProvider } from '@/lib/SupabaseDataProvider';
import { DataProvider as MockDataProvider } from '@/lib/DataContext';

export function DataProvider({ children }: { children: ReactNode }) {
  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  if (isSupabaseConfigured) {
    return <SupabaseDataProvider>{children}</SupabaseDataProvider>;
  }

  return <MockDataProvider>{children}</MockDataProvider>;
}
