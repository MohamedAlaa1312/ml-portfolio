import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL('/admin/preview', request.url);
  return NextResponse.redirect(url);
}
