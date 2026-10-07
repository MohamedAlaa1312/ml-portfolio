import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Skill } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/skills
 * Retrieves all skills and categories.
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
    const [skills, categories] = await Promise.all([
      AdminService.getAllSkills(),
      AdminService.getSkillCategories(),
    ]);

    return NextResponse.json({
      success: true,
      skills,
      categories,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch skills';
    console.error('[GET /api/admin/skills] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading skills.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/skills
 * Creates a new skill entry.
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
    const { name, category, proficiency, icon, enabled, display_order } = body;

    // 1. Mandatory Validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Skill name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // Proficiency validation (0-100 or null)
    let cleanProficiency: number | null = null;
    if (proficiency !== undefined && proficiency !== null && proficiency !== '') {
      const num = Number(proficiency);
      if (isNaN(num) || num < 0 || num > 100) {
        return NextResponse.json(
          { error: 'Proficiency must be a number between 0 and 100.' },
          { status: 400 }
        );
      }
      cleanProficiency = num;
    }

    // Calculate display order if omitted
    let order = typeof display_order === 'number' ? display_order : 1;
    if (typeof display_order !== 'number') {
      const existing = await AdminService.getAllSkills().catch(() => [] as Skill[]);
      const categorySkills = existing.filter((s) => s.category.toLowerCase() === category.trim().toLowerCase());
      const maxOrder = (categorySkills.length > 0 ? categorySkills : existing).reduce(
        (max, item) => Math.max(max, item.display_order || 0),
        0
      );
      order = maxOrder + 1;
    }

    const payload: Partial<Skill> = {
      name: name.trim(),
      category: category.trim(),
      proficiency: cleanProficiency,
      icon: icon?.trim() || null,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      display_order: order,
    };

    const newSkill = await AdminService.upsertSkill(payload);

    // Revalidate paths
    try {
      revalidatePath('/');
      revalidatePath('/admin/skills');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Skill created successfully.',
      skill: newSkill,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create skill';
    console.error('[POST /api/admin/skills] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to create skill. Please try again.' },
      { status: 500 }
    );
  }
}
