import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/publishing/discard
 * Discards a specific draft or all pending drafts.
 * Body: { draftId?: string, all?: boolean }
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
    const body = await request.json().catch(() => ({}));
    const { draftId, all } = body;

    if (!draftId && !all) {
      return NextResponse.json(
        { error: 'Must specify either draftId or all: true to discard.' },
        { status: 400 }
      );
    }

    if (all) {
      await AdminService.discardAllDrafts();
    } else {
      await AdminService.discardDraft(draftId);
    }

    try {
      revalidatePath('/admin/publishing');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/sections');
      revalidatePath('/admin/projects');
      revalidatePath('/admin/experience');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/certifications');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: all
        ? 'All unpublished draft changes discarded.'
        : 'Draft discarded successfully.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Discard operation failed';
    console.error('[POST /api/admin/publishing/discard] Error:', msg);
    return NextResponse.json(
      { error: 'Internal server error during discard operation.' },
      { status: 500 }
    );
  }
}
