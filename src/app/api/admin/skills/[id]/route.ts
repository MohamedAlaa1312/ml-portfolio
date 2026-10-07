import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Skill } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/skills/[id]
 * Retrieves details for a specific skill.
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
    const skill = await AdminService.getSkillById(id);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      skill,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve skill';
    console.error('[GET /api/admin/skills/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading skill record.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/skills/[id]
 * Updates an existing skill.
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
    const { name, category, proficiency, icon, enabled, display_order } = body;

    // Validate existence
    const existing = await AdminService.getSkillById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found.' },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return NextResponse.json(
        { error: 'Skill name cannot be empty.' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
      return NextResponse.json(
        { error: 'Category cannot be empty.' },
        { status: 400 }
      );
    }

    // Proficiency validation (0-100 or null)
    let cleanProficiency = existing.proficiency;
    if (proficiency !== undefined) {
      if (proficiency === null || proficiency === '') {
        cleanProficiency = null;
      } else {
        const num = Number(proficiency);
        if (isNaN(num) || num < 0 || num > 100) {
          return NextResponse.json(
            { error: 'Proficiency must be a number between 0 and 100.' },
            { status: 400 }
          );
        }
        cleanProficiency = num;
      }
    }

    const payload: Partial<Skill> = {
      id,
      name: name !== undefined ? name.trim() : existing.name,
      category: category !== undefined ? category.trim() : existing.category,
      proficiency: cleanProficiency,
      icon: icon !== undefined ? (icon ? icon.trim() : null) : existing.icon,
      enabled: enabled !== undefined ? Boolean(enabled) : existing.enabled,
      display_order: typeof display_order === 'number' ? display_order : existing.display_order,
    };

    const updatedSkill = await AdminService.upsertSkill(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Skill updated successfully.',
      skill: updatedSkill,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update skill';
    console.error('[PUT /api/admin/skills/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update skill. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/skills/[id]
 * Permanently deletes a skill.
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
    const existing = await AdminService.getSkillById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found.' },
        { status: 404 }
      );
    }

    await AdminService.deleteSkill(id);

    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: `Skill "${existing.name}" was successfully removed.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete skill';
    console.error('[DELETE /api/admin/skills/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to delete skill. Please try again.' },
      { status: 500 }
    );
  }
}
