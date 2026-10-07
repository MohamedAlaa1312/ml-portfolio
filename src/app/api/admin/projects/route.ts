import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Project, PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: PublishStatus[] = ['draft', 'published', 'archived'];

function isValidUrl(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  return false;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * GET /api/admin/projects
 * Retrieves all projects ordered by display_order.
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
    const list = await AdminService.getAllProjects();
    return NextResponse.json({
      success: true,
      projects: list,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch projects';
    console.error('[GET /api/admin/projects] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading projects.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects
 * Creates a new project entry.
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
      title,
      slug,
      short_description,
      full_description,
      thumbnail,
      thumbnail_url,
      gallery_urls,
      technologies,
      github_url,
      live_url,
      featured,
      display_order,
      enabled,
      status,
    } = body;

    // 1. Mandatory Validations
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Project title is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!short_description || typeof short_description !== 'string' || !short_description.trim()) {
      return NextResponse.json(
        { error: 'Short description is required.' },
        { status: 400 }
      );
    }

    // 2. Slug generation & uniqueness check
    const existingProjects = await AdminService.getAllProjects().catch(() => [] as Project[]);
    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);
    if (!finalSlug) finalSlug = `project-${Date.now()}`;

    // If duplicate slug exists, append short hash
    const slugCollision = existingProjects.some((p) => p.slug.toLowerCase() === finalSlug.toLowerCase());
    if (slugCollision) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 3. URL validations
    if (!isValidUrl(github_url)) {
      return NextResponse.json(
        { error: 'GitHub URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if (!isValidUrl(live_url)) {
      return NextResponse.json(
        { error: 'Live Demo URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if (!isValidUrl(thumbnail_url || thumbnail)) {
      return NextResponse.json(
        { error: 'Thumbnail URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    // 4. Clean arrays
    const cleanTechnologies = Array.isArray(technologies)
      ? technologies.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : [];

    const cleanGallery = Array.isArray(gallery_urls)
      ? gallery_urls.filter((g) => typeof g === 'string' && g.trim()).map((g) => g.trim())
      : [];

    // 5. Status & Enabled calculation
    const validatedStatus: PublishStatus = VALID_STATUSES.includes(status) ? status : 'published';
    const isEnabled = enabled !== undefined ? Boolean(enabled) : validatedStatus === 'published';

    // 6. Display order
    let order = typeof display_order === 'number' ? display_order : 1;
    if (typeof display_order !== 'number') {
      const maxOrder = existingProjects.reduce((max, item) => Math.max(max, item.display_order || 0), 0);
      order = maxOrder + 1;
    }

    const resolvedThumbnail = thumbnail_url?.trim() || thumbnail?.trim() || null;

    const payload: Partial<Project> = {
      title: title.trim(),
      slug: finalSlug,
      short_description: short_description.trim(),
      full_description: full_description ? full_description.trim() : '',
      thumbnail: resolvedThumbnail,
      thumbnail_url: resolvedThumbnail,
      gallery_urls: cleanGallery,
      technologies: cleanTechnologies,
      github_url: github_url ? github_url.trim() : null,
      live_url: live_url ? live_url.trim() : null,
      featured: Boolean(featured),
      display_order: order,
      enabled: isEnabled,
      status: validatedStatus,
    };

    const newProject = await AdminService.upsertProject(payload);

    try {
      revalidatePath('/');
      revalidatePath('/admin/projects');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully.',
      project: newProject,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
    console.error('[POST /api/admin/projects] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to create project. Please try again.' },
      { status: 500 }
    );
  }
}
