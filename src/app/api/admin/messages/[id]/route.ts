import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/messages/[id]
 * Mark message as read/unread.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const read = body.read !== undefined ? Boolean(body.read) : true;

    await AdminService.markContactMessageRead(id, read);

    return NextResponse.json({
      success: true,
      message: `Message marked as ${read ? 'read' : 'unread'}.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update message';
    console.error('[PATCH /api/admin/messages/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update message status.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Remove message permanently.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    await AdminService.deleteContactMessage(id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete message';
    console.error('[DELETE /api/admin/messages/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to delete message.' },
      { status: 500 }
    );
  }
}
