import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/media/[id]
 * Retrieves a single media item with its usage references.
 * Guarded by AuthServerService.isAdmin().
 */
export async function GET(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const media = await AdminService.getMediaById(id);
    if (!media) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      media,
      ...media,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve media item';
    console.error('[GET /api/admin/media/[id]] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading media details.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/media/[id]
 * Updates media metadata (title, alt_text, description).
 * Guarded by AuthServerService.isAdmin().
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
    const body = await request.json();
    const { title, alt_text, description } = body;

    const existing = await AdminService.getMediaById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    const updated = await AdminService.updateMediaMetadata(id, {
      title,
      alt_text,
      description,
    });

    return NextResponse.json({
      success: true,
      message: 'Media metadata updated successfully.',
      media: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update media metadata';
    console.error('[PATCH /api/admin/media/[id]] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating media metadata.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/media/[id]
 * Safely deletes an unused media item.
 * REQUIREMENT 20: Used Media Protection - If media is referenced by active content,
 * deletion MUST be rejected with a 400 Bad Request explaining where it is used.
 * Guarded by AuthServerService.isAdmin().
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
    const res = await AdminService.deleteMedia(id);

    if (!res.success) {
      return NextResponse.json(
        {
          error: res.message,
          inUse: res.error === 'Media in use',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: res.message,
      deletedPath: res.deletedPath,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete media asset';
    console.error('[DELETE /api/admin/media/[id]] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting media asset.' },
      { status: 500 }
    );
  }
}
