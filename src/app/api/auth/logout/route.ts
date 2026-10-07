import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[Logout Route] Error signing out:', err);
  }

  const url = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.delete('sb-admin-auth-preview');
  return response;
}

export async function GET(request: Request) {
  return POST(request);
}

