import { useContext } from 'react';
import { SupabaseAuthContext } from '@/lib/SupabaseAuthContext';
import type { SupabaseAuthContextValue } from '@/types/auth';

export function useSupabaseAuth(): SupabaseAuthContextValue {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
