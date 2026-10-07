import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Experience, PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: PublishStatus[] = ['draft', 'published', 'archived'];

/**
 * GET /api/admin/experience/[id]
 * Retrieves details for a specific experience entry.
 */
export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

  try {
    const experience = await AdminService.getExperienceById(id);
    if (!experience) {
      return NextResponse.json(
        { error: 'Experience entry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      experience,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve experience';
    console.error('[GET /api/admin/experience/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading experience record.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/experience/[id]
 * Updates an existing experience entry.
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

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

    // Validate existence
    const existing = await AdminService.getExperienceById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Experience entry not found.' },
        { status: 404 }
      );
    }

    // Validate mandatory fields
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

    const isCurrentPosition = Boolean(is_current);
    const resolvedEndDate = isCurrentPosition ? null : (end_date?.trim() || null);

    const cleanAchievements = Array.isArray(achievements)
      ? achievements.filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim())
      : existing.achievements;

    const cleanResponsibilities = Array.isArray(responsibilities)
      ? responsibilities.filter((r) => typeof r === 'string' && r.trim()).map((r) => r.trim())
      : existing.responsibilities;

    const cleanTechnologies = Array.isArray(technologies)
      ? technologies.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : existing.technologies;

    const validatedStatus: PublishStatus = VALID_STATUSES.includes(status)
      ? status
      : existing.status;

    const payload: Partial<Experience> = {
      id,
      company: company.trim(),
      role: role.trim(),
      employment_type: employment_type?.trim() || existing.employment_type || 'Full-time',
      location: location !== undefined ? location?.trim() : existing.location,
      start_date: start_date.trim(),
      end_date: resolvedEndDate,
      is_current: isCurrentPosition,
      current_position: isCurrentPosition,
      description: description !== undefined ? description?.trim() : existing.description,
      responsibilities: cleanResponsibilities,
      technologies: cleanTechnologies,
      achievements: cleanAchievements,
      company_logo: company_logo !== undefined ? company_logo : existing.company_logo,
      company_logo_url: company_logo_url !== undefined ? company_logo_url : existing.company_logo_url,
      display_order: typeof display_order === 'number' ? display_order : existing.display_order,
      enabled: enabled !== undefined ? Boolean(enabled) : existing.enabled,
      status: validatedStatus,
    };

    const updatedExperience = await AdminService.upsertExperience(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/experience');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Experience entry updated successfully.',
      experience: updatedExperience,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update experience';
    console.error('[PUT /api/admin/experience/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update experience entry. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/experience/[id]
 * Permanently removes or archives an experience entry.
 */
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

  try {
    const existing = await AdminService.getExperienceById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Experience entry not found.' },
        { status: 404 }
      );
    }

    await AdminService.deleteExperience(id);

    try {
      revalidatePath('/');
      revalidatePath('/admin/experience');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: `Experience record for "${existing.role} at ${existing.company}" was successfully removed.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete experience';
    console.error('[DELETE /api/admin/experience/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to delete experience entry. Please try again.' },
      { status: 500 }
    );
  }
}
