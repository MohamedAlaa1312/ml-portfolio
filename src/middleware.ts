import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;

  // Development mode preview bypass for visual testing
  if (process.env.NODE_ENV === 'development') {
    if (request.cookies.get('sb-admin-auth-preview')?.value === 'active') {
      return response;
    }
  }

  const isProtectedAdminRoute =
    pathname.startsWith('/admin') && pathname !== '/admin/login';

  // Protect Admin routes even if backend is unconfigured
  if (isProtectedAdminRoute) {
    if (!supabaseUrl || !supabaseAnonKey) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // If Supabase environment variables are missing, pass through remaining public routes
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine if authenticated user possesses Admin authorization
  let isAuthorizedAdmin = false;
  if (user) {
    const role = user.app_metadata?.role;
    if (role === 'admin' || role === 'superadmin') {
      isAuthorizedAdmin = true;
    } else {
      try {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        const dbRole = (adminRecord as { role?: string })?.role;
        if (dbRole === 'admin' || dbRole === 'superadmin') {
          isAuthorizedAdmin = true;
        }
      } catch {
        isAuthorizedAdmin = false;
      }
    }
  }

  // Protect all Admin routes
  if (isProtectedAdminRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (!isAuthorizedAdmin) {
      // Authenticated non-admin: reject immediately with unauthorized error
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated Admin visiting /admin root: direct to /admin/dashboard
    if (pathname === '/admin') {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // If already logged in on /admin/login:
  if (pathname === '/admin/login') {
    // Only redirect to dashboard if the user is ACTUALLY an authorized admin,
    // and they aren't on the login page because of an unauthorized error.
    if (isAuthorizedAdmin && !request.nextUrl.searchParams.has('error')) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
