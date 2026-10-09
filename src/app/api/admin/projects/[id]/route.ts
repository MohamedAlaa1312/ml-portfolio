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
 * GET /api/admin/projects/[id]
 * Retrieves details for a specific project.
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
    const project = await AdminService.getProjectById(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve project';
    console.error('[GET /api/admin/projects/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading project record.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/projects/[id]
 * Updates an existing project.
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

    // Validate existence
    const existing = await AdminService.getProjectById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json(
        { error: 'Project title cannot be empty.' },
        { status: 400 }
      );
    }

    // Validate short description if provided
    if (short_description !== undefined && (typeof short_description !== 'string' || !short_description.trim())) {
      return NextResponse.json(
        { error: 'Short description cannot be empty.' },
        { status: 400 }
      );
    }

    // Slug update & collision check
    let finalSlug = existing.slug;
    if (slug !== undefined) {
      const cleanSlug = generateSlug(slug);
      if (!cleanSlug) {
        return NextResponse.json(
          { error: 'Slug cannot be empty.' },
          { status: 400 }
        );
      }
      if (cleanSlug !== existing.slug) {
        const allProjects = await AdminService.getAllProjects().catch(() => [] as Project[]);
        const collision = allProjects.find(
          (p) => p.id !== existing.id && p.slug.toLowerCase() === cleanSlug.toLowerCase()
        );
        if (collision) {
          return NextResponse.json(
            { error: `Slug "${cleanSlug}" is already in use by another project.` },
            { status: 400 }
          );
        }
        finalSlug = cleanSlug;
      }
    }

    // URL validations
    if (github_url !== undefined && !isValidUrl(github_url)) {
      return NextResponse.json(
        { error: 'GitHub URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if (live_url !== undefined && !isValidUrl(live_url)) {
      return NextResponse.json(
        { error: 'Live Demo URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if (thumbnail_url !== undefined && !isValidUrl(thumbnail_url)) {
      return NextResponse.json(
        { error: 'Thumbnail URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    const cleanTechnologies = Array.isArray(technologies)
      ? technologies.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : existing.technologies;

    const cleanGallery = Array.isArray(gallery_urls)
      ? gallery_urls.filter((g) => typeof g === 'string' && g.trim()).map((g) => g.trim())
      : existing.gallery_urls;

    const validatedStatus: PublishStatus =
      status && VALID_STATUSES.includes(status) ? status : existing.status;

    let isEnabled = existing.enabled ?? (existing.status === 'published');
    if (enabled !== undefined) {
      isEnabled = Boolean(enabled);
    }

    const resolvedThumbnail =
      thumbnail_url !== undefined
        ? (thumbnail_url ? thumbnail_url.trim() : null)
        : (thumbnail !== undefined ? (thumbnail ? thumbnail.trim() : null) : existing.thumbnail_url);

    const payload: Partial<Project> = {
      id: existing.id,
      title: title !== undefined ? title.trim() : existing.title,
      slug: finalSlug,
      short_description: short_description !== undefined ? short_description.trim() : existing.short_description,
      full_description: full_description !== undefined ? full_description.trim() : existing.full_description,
      thumbnail: resolvedThumbnail,
      thumbnail_url: resolvedThumbnail,
      gallery_urls: cleanGallery,
      technologies: cleanTechnologies,
      github_url: github_url !== undefined ? (github_url ? github_url.trim() : null) : existing.github_url,
      live_url: live_url !== undefined ? (live_url ? live_url.trim() : null) : existing.live_url,
      featured: featured !== undefined ? Boolean(featured) : existing.featured,
      display_order: typeof display_order === 'number' ? display_order : existing.display_order,
      enabled: isEnabled,
      status: validatedStatus,
    };

    const updatedProject = await AdminService.upsertProject(payload);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/projects');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/sections');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully.',
      project: updatedProject,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
    console.error('[PUT /api/admin/projects/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to update project. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Permanently removes a project entry.
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
    const existing = await AdminService.getProjectById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    await AdminService.deleteProject(id);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/projects');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/sections');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: `Project "${existing.title}" was successfully removed.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
    console.error('[DELETE /api/admin/projects/[id]] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to delete project. Please try again.' },
      { status: 500 }
    );
  }
}
