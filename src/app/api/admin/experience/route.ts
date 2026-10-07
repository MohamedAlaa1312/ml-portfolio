import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Experience, PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: PublishStatus[] = ['draft', 'published', 'archived'];

/**
 * GET /api/admin/experience
 * Retrieves all professional experiences ordered by display_order.
 * Guarded by AuthServerService.isAdmin().
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
    const list = await AdminService.getAllExperience();
    return NextResponse.json({
      success: true,
      experience: list,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch experience entries';
    console.error('[GET /api/admin/experience] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading experience records.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/experience
 * Creates a new experience entry.
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
    const {
      company,
      role,
      employment_type,
      location,
      start_date,
      end_date,
      is_current,
      description,
      responsibilities,
      technologies,
      achievements,
      company_logo,
      company_logo_url,
      display_order,
      enabled,
      status,
    } = body;

    // 1. Mandatory Validations
    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json(
        { error: 'Company name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!role || typeof role !== 'string' || !role.trim()) {
      return NextResponse.json(
        { error: 'Role title is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!start_date || typeof start_date !== 'string' || !start_date.trim()) {
      return NextResponse.json(
        { error: 'Start date is required.' },
        { status: 400 }
      );
    }

    // Determine current position status
    const isCurrentPosition = Boolean(is_current);
    const resolvedEndDate = isCurrentPosition ? null : (end_date?.trim() || null);

    // Validate arrays
    const cleanAchievements = Array.isArray(achievements)
      ? achievements.filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim())
      : [];

    const cleanResponsibilities = Array.isArray(responsibilities)
      ? responsibilities.filter((r) => typeof r === 'string' && r.trim()).map((r) => r.trim())
      : [];

    const cleanTechnologies = Array.isArray(technologies)
      ? technologies.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : [];

    const validatedStatus: PublishStatus = VALID_STATUSES.includes(status) ? status : 'published';

    // Calculate display order if omitted
    let order = typeof display_order === 'number' ? display_order : 1;
    if (typeof display_order !== 'number') {
      const existing = await AdminService.getAllExperience().catch(() => [] as Experience[]);
      const maxOrder = existing.reduce((max, item) => Math.max(max, item.display_order || 0), 0);
      order = maxOrder + 1;
    }

    const payload: Partial<Experience> = {
      company: company.trim(),
      role: role.trim(),
      employment_type: employment_type?.trim() || 'Full-time',
      location: location?.trim() || 'Remote',
      start_date: start_date.trim(),
      end_date: resolvedEndDate,
      is_current: isCurrentPosition,
      current_position: isCurrentPosition,
      description: description?.trim() || '',
      responsibilities: cleanResponsibilities,
      technologies: cleanTechnologies,
      achievements: cleanAchievements,
      company_logo: company_logo || company_logo_url || null,
      company_logo_url: company_logo_url || company_logo || null,
      display_order: order,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      status: validatedStatus,
    };

    const newExperience = await AdminService.upsertExperience(payload);

    // Revalidate paths
    try {
      revalidatePath('/');
      revalidatePath('/admin/experience');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Experience entry created successfully.',
      experience: newExperience,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create experience entry';
    console.error('[POST /api/admin/experience] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to create experience entry. Please try again.' },
      { status: 500 }
    );
  }
}
