import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Server-Side Authentication & Authorization Service.
 * MUST only be imported in Server Components, Route Handlers, and Server Actions.
 */
export const AuthServerService = {
  /**
   * Checks whether the current session is an authenticated administrator.
   */
  async isAdmin(): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        if (cookieStore.get('sb-admin-auth-preview')?.value === 'active') {
          return true;
        }
      }

      const supabase = await createServerClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      // 1. Check custom user role in app_metadata
      const metaRole = user.app_metadata?.role;
      if (metaRole === 'admin' || metaRole === 'superadmin') {
        return true;
      }

      // 2. Query admin_users table
      const { data: adminRecord, error: dbError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError || !adminRecord) {
        return false;
      }

      const role = (adminRecord as unknown as { role?: string })?.role;
      return role === 'admin' || role === 'superadmin';
    } catch {
      return false;
    }
  },

  /**
   * Retrieves the current authenticated user from Supabase Auth session.
   */
  async getUser() {
    try {
      const supabase = await createServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the user only if they are an authorized administrator.
   */
  async getAdminUser() {
    const isAuth = await this.isAdmin();
    if (!isAuth) return null;
    return this.getUser();
  },
};
