import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { SkillCategory, Skill } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/skills/categories
 * Retrieves all skill categories ordered by display_order.
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
    const categories = await AdminService.getSkillCategories();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch categories';
    console.error('[GET /api/admin/skills/categories] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading categories.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/skills/categories
 * Creates a new skill category.
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
    const { name, description, icon, enabled, display_order } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const existingCategories = await AdminService.getSkillCategories();
    const duplicate = existingCategories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `Category "${name.trim()}" already exists.` },
        { status: 400 }
      );
    }

    const order = typeof display_order === 'number' ? display_order : existingCategories.length + 1;

    const payload: Partial<SkillCategory> = {
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon?.trim() || '⚡',
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      display_order: order,
    };

    const newCategory = await AdminService.upsertSkillCategory(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      category: newCategory,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create category';
    console.error('[POST /api/admin/skills/categories] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to create category. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/skills/categories
 * Updates an existing skill category and cascades any name change to skills.
 */
export async function PUT(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, description, icon, enabled, display_order } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const existingCategories = await AdminService.getSkillCategories();
    const current = existingCategories.find((c) => c.id === id);
    if (!current) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      );
    }

    // Check duplicate name on another category
    const duplicate = existingCategories.find(
      (c) => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `Another category named "${name.trim()}" already exists.` },
        { status: 400 }
      );
    }

    const payload: Partial<SkillCategory> = {
      id,
      name: name.trim(),
      description: description !== undefined ? description?.trim() : current.description,
      icon: icon !== undefined ? (icon?.trim() || '⚡') : current.icon,
      enabled: enabled !== undefined ? Boolean(enabled) : current.enabled,
      display_order: typeof display_order === 'number' ? display_order : current.display_order,
    };

    const updatedCategory = await AdminService.upsertSkillCategory(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
      category: updatedCategory,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update category';
    console.error('[PUT /api/admin/skills/categories] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update category. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/skills/categories
 * Deletes a category with safety checks for assigned skills.
 */
export async function DELETE(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let force = searchParams.get('force') === 'true';

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
        if (body.force !== undefined) force = Boolean(body.force);
      } catch {
        // ignore json parse error
      }
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    const categories = await AdminService.getSkillCategories();
    const target = categories.find((c) => c.id === id);
    if (!target) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      );
    }

    // Safety check: count skills assigned to this category
    const skills = await AdminService.getAllSkills().catch(() => [] as Skill[]);
    const assignedSkills = skills.filter(
      (s) => s.category.toLowerCase() === target.name.toLowerCase()
    );

    if (assignedSkills.length > 0 && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${target.name}" because it contains ${assignedSkills.length} skill(s). Please reassign or delete these skills first, or confirm force deletion.`,
          skillCount: assignedSkills.length,
          canForce: true,
        },
        { status: 400 }
      );
    }

    await AdminService.deleteSkillCategory(id);

    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: `Category "${target.name}" deleted successfully.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete category';
    console.error('[DELETE /api/admin/skills/categories] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to delete category. Please try again.' },
      { status: 500 }
    );
  }
}
