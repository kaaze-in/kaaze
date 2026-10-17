import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

export function getSupabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
}

/**
 * Checks dynamically whether Supabase credentials have been configured in .env.local
 */
export function checkIsSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url !== 'https://your-project-ref.supabase.co' &&
    key !== 'your-supabase-anon-publishable-key' &&
    !url.includes('your-project-ref') &&
    !key.includes('your-supabase-anon')
  );
}

export const isSupabaseConfigured: boolean = checkIsSupabaseConfigured();

let supabaseInstance: SupabaseClient | null = null;

/**
 * Reusable Supabase client singleton for browser and client-side operations.
 */
export function getSupabase(): SupabaseClient | null {
  if (!checkIsSupabaseConfigured()) {
    return null;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = getSupabase();
