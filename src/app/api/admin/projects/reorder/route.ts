import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/projects/reorder
 * Reorders projects by an array of IDs.
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
        { error: 'orderedIds must be a non-empty array of project IDs.' },
        { status: 400 }
      );
    }

    await AdminService.reorderProjects(orderedIds);

    try {
      revalidatePath('/');
      revalidatePath('/admin/projects');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Projects reordered successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reorder projects';
    console.error('[POST /api/admin/projects/reorder] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to reorder projects. Please try again.' },
      { status: 500 }
    );
  }
}
