import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Creates a browser-side Supabase client for public queries and auth subscriptions.
 * Uses only the public Anon Key and is safe for client components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
