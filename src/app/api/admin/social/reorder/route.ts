import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/social/reorder
 * Updates the display order of social links.
 */
export async function POST(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: 'orderedIds array is required.' },
        { status: 400 }
      );
    }

    await AdminService.reorderSocialLinks(orderedIds);

    try {
      revalidatePath('/');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    const updatedList = await AdminService.getSocialLinks();

    return NextResponse.json({
      success: true,
      message: 'Social link order updated.',
      socialLinks: updatedList,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reorder social links';
    console.error('[POST /api/admin/social/reorder] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while reordering social links.' },
      { status: 500 }
    );
  }
}
