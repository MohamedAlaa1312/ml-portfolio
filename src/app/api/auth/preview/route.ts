import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }

  const rawRedirect = request.nextUrl.searchParams.get('redirect') || '/admin/dashboard';
  // Strictly sanitize redirect to prevent Open Redirect attacks
  const isSafeRelative =
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.includes('\\') &&
    !rawRedirect.includes('@');
  const safeRedirect = isSafeRelative ? rawRedirect : '/admin/dashboard';

  const response = NextResponse.redirect(new URL(safeRedirect, request.url));

  response.cookies.set('sb-admin-auth-preview', 'active', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
