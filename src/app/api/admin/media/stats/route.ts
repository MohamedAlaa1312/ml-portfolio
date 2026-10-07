import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/media/stats
 * Retrieves aggregate statistics for the Media Library and Admin Dashboard.
 * Guarded by AuthServerService.isAdmin().
 */
export async function GET() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const stats = await AdminService.getMediaStats();
    return NextResponse.json({
      success: true,
      stats,
      ...stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve media statistics';
    console.error('[GET /api/admin/media/stats] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading media statistics.' },
      { status: 500 }
    );
  }
}
