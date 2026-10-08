import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { CmsService } from '@/services/cms.service';
import type { Section, AboutContent, PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/about
 * Retrieves the About dynamic section and site settings for the Admin About Editor.
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
    const [sections, siteSettings] = await Promise.all([
      AdminService.getAllSections().catch(() => [] as Section[]),
      AdminService.getSiteSettings().catch(() => null),
    ]);

    const aboutSection =
      sections.find((s) => s.type === 'about' || s.slug === 'about') || null;

    return NextResponse.json({
      success: true,
      aboutSection,
      siteSettings,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch about content';
    console.error('[GET /api/admin/about] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading About configuration.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/about
 * Creates or updates the About dynamic section.
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
    const { title, badge, heading, description, pillars, avatarUrl, enabled, status } = body;

    // Validate inputs
    const validatedStatus: PublishStatus = ['draft', 'published', 'archived'].includes(status)
      ? status
      : 'published';

    // Validate pillars if provided
    let cleanPillars: Array<{ title: string; description: string; icon?: string }> = [];
    if (Array.isArray(pillars)) {
      cleanPillars = pillars
        .filter((p) => p && typeof p === 'object' && typeof p.title === 'string' && p.title.trim())
        .map((p) => ({
          title: String(p.title).trim(),
          description: String(p.description || '').trim(),
          icon: p.icon ? String(p.icon).trim() : undefined,
        }));
    }

    // Retrieve existing section ID if available
    const sections = await AdminService.getAllSections().catch(() => [] as Section[]);
    const existingAbout = sections.find((s) => s.type === 'about' || s.slug === 'about');

    const aboutContent: AboutContent = {
      badge: typeof badge === 'string' ? badge.trim() : undefined,
      heading: typeof heading === 'string' ? heading.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : '',
      pillars: cleanPillars,
      avatarUrl: typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : undefined,
    };

    const sectionPayload: Partial<Section> & { slug: string } = {
      id: existingAbout?.id,
      type: 'about',
      title: typeof title === 'string' && title.trim() ? title.trim() : 'About Me',
      slug: 'about',
      content: aboutContent as any,
      display_order: existingAbout?.display_order || 2,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      status: validatedStatus,
    };

    const updatedSection = await AdminService.upsertSection(sectionPayload);

    // Revalidate public and admin paths
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/about');
      revalidatePath('/admin/dashboard');
    } catch {
      // Non-blocking revalidation
    }

    return NextResponse.json({
      success: true,
      message: 'About section updated successfully.',
      section: updatedSection,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update about section';
    console.error('[POST /api/admin/about] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to save About section changes. Please try again.' },
      { status: 500 }
    );
  }
}
