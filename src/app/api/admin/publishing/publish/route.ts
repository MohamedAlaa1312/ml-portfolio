import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/publishing/publish
 * Publishes a specific draft or all pending drafts.
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
        { error: 'Must specify either draftId or all: true to publish.' },
        { status: 400 }
      );
    }

    let result: { success?: boolean; publishedCount?: number; message: string };

    if (all) {
      const res = await AdminService.publishAllDrafts();
      result = { success: true, publishedCount: res.publishedCount, message: res.message };
    } else {
      const res = await AdminService.publishDraft(draftId);
      if (!res.success) {
        return NextResponse.json(
          { error: res.message || 'Failed to publish draft.' },
          { status: 400 }
        );
      }
      result = { success: true, message: res.message };
    }

    try {
      revalidatePath('/');
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
      message: result.message,
      ...(result.publishedCount !== undefined && { publishedCount: result.publishedCount }),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Publish operation failed';
    console.error('[POST /api/admin/publishing/publish] Error:', msg);
    return NextResponse.json(
      { error: 'Internal server error during publish operation.' },
      { status: 500 }
    );
  }
}
