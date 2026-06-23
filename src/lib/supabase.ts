import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Checks whether a URL matches the expected Supabase URL pattern: https://*.supabase.co
 */
export function isValidSupabaseUrl(url: string): boolean {
  return /^https:\/\/.*\.supabase\.co$/.test(url);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase environment variables. ` +
      `Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.`
  );
}

if (!isValidSupabaseUrl(supabaseUrl)) {
  console.warn(
    '[Supabase] URL may be invalid. Expected pattern: https://*.supabase.co'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
