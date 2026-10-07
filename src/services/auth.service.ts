import { createClient } from '@/lib/supabase/client';

/**
 * Client-Side Authentication Service for Admin operations.
 * Safe to import in 'use client' components.
 */
export const AuthService = {
  /**
   * Client-side sign in helper with email and password.
   */
  async signIn(email: string, password: string) {
    const supabase = createClient();
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Client-side sign out helper.
   */
  async signOut() {
    const supabase = createClient();
    return await supabase.auth.signOut();
  },
};
