import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sections
 * Returns all configured sections across all statuses and visibility states,
 * ordered deterministically by display_order.
 */
export async function GET() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const sections = await AdminService.getAllSections();
    return NextResponse.json({
      success: true,
      sections,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sections';
    console.error('[GET /api/admin/sections] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while fetching sections.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sections
 * Upserts a section.
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
    const { slug, title, type, content, display_order, enabled, status } = body;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { error: 'Section slug is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Section title is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const payload = {
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      type: type || 'custom',
      content: content || {},
      ...(display_order !== undefined && { display_order: Number(display_order) }),
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      ...(status !== undefined && { status }),
    };

    const section = await AdminService.upsertSection(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/sections');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Section created/updated successfully.',
      section,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save section';
    console.error('[POST /api/admin/sections] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while saving section.' },
      { status: 500 }
    );
  }
}
