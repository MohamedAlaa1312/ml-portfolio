import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { isValidUrl } from '@/lib/social-utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/social/[id]
 * Updates an existing social link.
 */
export async function PUT(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { platform, label, url, icon, display_order, enabled } = body;

    if (platform !== undefined && (!platform || typeof platform !== 'string' || !platform.trim())) {
      return NextResponse.json(
        { error: 'Platform name cannot be empty.' },
        { status: 400 }
      );
    }

    if (url !== undefined) {
      if (!url || typeof url !== 'string' || !url.trim()) {
        return NextResponse.json(
          { error: 'Social URL cannot be empty.' },
          { status: 400 }
        );
      }
      if (!isValidUrl(url.trim())) {
        return NextResponse.json(
          { error: 'Please enter a valid URL (e.g. https://... or mailto:...).' },
          { status: 400 }
        );
      }
    }

    const payload = {
      id,
      ...(platform !== undefined && { platform: platform.trim() }),
      ...(label !== undefined && { label: label.trim() }),
      ...(url !== undefined && { url: url.trim() }),
      ...(icon !== undefined && { icon: icon.trim() }),
      ...(display_order !== undefined && { display_order: Number(display_order) }),
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
    };

    const updated = await AdminService.upsertSocialLink(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Social link updated successfully.',
      socialLink: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update social link';
    console.error(`[PUT /api/admin/social/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while updating social link.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/social/[id]
 * Toggles or updates enabled status of a social link.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const updated = await AdminService.toggleSocialLink(id, body.enabled);

    if (!updated) {
      return NextResponse.json(
        { error: 'Social link not found.' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: updated.enabled ? 'Social link enabled.' : 'Social link disabled.',
      socialLink: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to toggle social link';
    console.error(`[PATCH /api/admin/social/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while toggling social link.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/social/[id]
 * Deletes a social link.
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
    await AdminService.deleteSocialLink(id);

    try {
      revalidatePath('/');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Social link deleted successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete social link';
    console.error(`[DELETE /api/admin/social/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while deleting social link.' },
      { status: 500 }
    );
  }
}
