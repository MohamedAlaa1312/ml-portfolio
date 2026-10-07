import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/sections/reorder
 * Atomically updates display_order of sections based on the submitted sequence.
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
        { error: 'Invalid request: orderedIds array must not be empty.' },
        { status: 400 }
      );
    }

    const updatedSections = await AdminService.reorderSections(orderedIds);

    try {
      revalidatePath('/');
      revalidatePath('/admin/sections');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Section order updated successfully.',
      sections: updatedSections,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reorder sections';
    console.error('[POST /api/admin/sections/reorder] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while reordering sections.' },
      { status: 500 }
    );
  }
}
