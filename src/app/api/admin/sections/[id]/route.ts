import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const CORE_SECTION_TYPES = new Set([
  'hero',
  'about',
  'experience',
  'skills',
  'projects',
  'certifications',
  'contact',
]);

const VALID_STATUSES = new Set<PublishStatus>(['draft', 'published', 'archived']);

/**
 * GET /api/admin/sections/[id]
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
    const section = await AdminService.getSectionById(id);
    if (!section) {
      return NextResponse.json(
        { error: 'Section not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      section,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch section';
    console.error(`[GET /api/admin/sections/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while fetching section.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/sections/[id]
 * Updates section visibility (enabled) and/or section metadata (title, status).
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
    const existing = await AdminService.getSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Section not found.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { enabled, title, status, slug } = body;

    // Strict Requirement 13: Hero Special Protection Rule
    if (
      (existing.type === 'hero' || existing.slug === 'hero') &&
      enabled === false
    ) {
      return NextResponse.json(
        {
          error:
            'The Hero section is a core identity section and cannot be disabled to protect public portfolio integrity.',
        },
        { status: 400 }
      );
    }

    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      return NextResponse.json(
        { error: 'Section title cannot be empty.' },
        { status: 400 }
      );
    }

    if (status !== undefined && !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Allowed values: published, draft, archived.' },
        { status: 400 }
      );
    }

    const updates = {
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      ...(title !== undefined && { title: title.trim() }),
      ...(status !== undefined && { status }),
      ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
    };

    const updated = await AdminService.updateSection(existing.id, updates);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/sections');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/projects');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message:
        enabled !== undefined
          ? enabled
            ? `"${existing.title}" section enabled.`
            : `"${existing.title}" section disabled.`
          : 'Section updated successfully.',
      section: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update section';
    console.error(`[PATCH /api/admin/sections/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while updating section.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sections/[id]
 * Full metadata update for a section.
 */
export async function PUT(request: Request, context: RouteContext) {
  return PATCH(request, context);
}

/**
 * DELETE /api/admin/sections/[id]
 * Deletes a section (strictly guarded against core sections).
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
    const existing = await AdminService.getSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Section not found.' },
        { status: 404 }
      );
    }

    // Strict Requirement 19 & 20: Protect Core Sections
    if (CORE_SECTION_TYPES.has(existing.type) || CORE_SECTION_TYPES.has(existing.slug)) {
      return NextResponse.json(
        { error: 'Core portfolio sections cannot be deleted.' },
        { status: 400 }
      );
    }

    await AdminService.deleteSection(existing.id);

    try {
      revalidatePath('/');
      revalidatePath('/admin/sections');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Section "${existing.title}" deleted successfully.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete section';
    console.error(`[DELETE /api/admin/sections/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while deleting section.' },
      { status: 500 }
    );
  }
}
