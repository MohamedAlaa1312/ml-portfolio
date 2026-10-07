import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/drafts/[id]
 * Retrieves a single draft by ID.
 */
export async function GET(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const draft = await AdminService.getDraftById(id);
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve draft';
    console.error(`[GET /api/admin/drafts/${id}] Error:`, msg);
    return NextResponse.json(
      { error: 'Internal server error while retrieving draft.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/drafts/[id]
 * Discards a specific draft without affecting the published baseline.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const existing = await AdminService.getDraftById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Draft not found.' },
        { status: 404 }
      );
    }

    await AdminService.discardDraft(id);

    return NextResponse.json({
      success: true,
      message: `Draft for "${existing.title}" discarded successfully. Published content remains unchanged.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to discard draft';
    console.error(`[DELETE /api/admin/drafts/${id}] Error:`, msg);
    return NextResponse.json(
      { error: 'Internal server error while discarding draft.' },
      { status: 500 }
    );
  }
}
