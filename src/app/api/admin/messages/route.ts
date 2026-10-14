import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/messages
 * Retrieves all contact messages for the admin inbox. Guarded by admin authorization.
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
    const messages = await AdminService.getContactMessages();
    return NextResponse.json({
      success: true,
      messages,
      totalCount: messages.length,
      unreadCount: messages.filter((m) => !m.read).length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
    console.error('[GET /api/admin/messages] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to retrieve messages.' },
      { status: 500 }
    );
  }
}
