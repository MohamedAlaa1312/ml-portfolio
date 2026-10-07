import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { DraftEntityType } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_ENTITY_TYPES = new Set<DraftEntityType>([
  'site_settings',
  'theme',
  'section',
  'sections_order',
  'project',
  'experience',
  'certification',
  'skill',
  'social_link',
]);

/**
 * GET /api/admin/drafts
 * Returns all active drafts and pending unpublished changes.
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
    const drafts = await AdminService.getAllDrafts();
    return NextResponse.json({
      success: true,
      drafts,
      totalDrafts: drafts.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve drafts';
    console.error('[GET /api/admin/drafts] Error:', msg);
    return NextResponse.json(
      { error: 'Internal server error while retrieving drafts.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/drafts
 * Saves or updates an active draft.
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
    const { id, entity_type, entity_id, title, summary, data } = body;

    if (!entity_type || !VALID_ENTITY_TYPES.has(entity_type as DraftEntityType)) {
      return NextResponse.json(
        {
          error: `Invalid or missing entity_type. Allowed: ${Array.from(
            VALID_ENTITY_TYPES
          ).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!entity_id || typeof entity_id !== 'string' || !entity_id.trim()) {
      return NextResponse.json(
        { error: 'entity_id is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Draft data payload must be a valid object.' },
        { status: 400 }
      );
    }

    const draft = await AdminService.saveDraft({
      id: id || undefined,
      entity_type: entity_type as DraftEntityType,
      entity_id: entity_id.trim(),
      title: title || `Draft: ${entity_type}`,
      summary: summary || undefined,
      data,
    });

    return NextResponse.json({
      success: true,
      message: `Draft for "${draft.title}" saved successfully.`,
      draft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save draft';
    console.error('[POST /api/admin/drafts] Error:', msg);
    return NextResponse.json(
      { error: 'Internal server error while saving draft.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/drafts
 * Discards all active drafts.
 */
export async function DELETE() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    await AdminService.discardAllDrafts();
    return NextResponse.json({
      success: true,
      message: 'All unpublished draft changes have been discarded.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to discard drafts';
    console.error('[DELETE /api/admin/drafts] Error:', msg);
    return NextResponse.json(
      { error: 'Internal server error while discarding drafts.' },
      { status: 500 }
    );
  }
}
