import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/experience/reorder
 * Updates the display_order of experience entries according to the provided sequence.
 * Guarded by AuthServerService.isAdmin().
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
        { error: 'Invalid payload: orderedIds must be a non-empty array of experience IDs.' },
        { status: 400 }
      );
    }

    await AdminService.reorderExperience(orderedIds);

    try {
      revalidatePath('/');
      revalidatePath('/admin/experience');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Experience display order updated successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reorder experiences';
    console.error('[POST /api/admin/experience/reorder] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update experience order. Please try again.' },
      { status: 500 }
    );
  }
}
