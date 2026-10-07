import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { isValidUrl } from '@/lib/social-utils';
import type { SocialLinkItem } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/social
 * Retrieves all social links in display order.
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
    const list = await AdminService.getSocialLinks();
    return NextResponse.json({
      success: true,
      socialLinks: list,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch social links';
    console.error('[GET /api/admin/social] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading social links.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/social
 * Creates or updates a social link entry.
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
    const { platform, label, url, icon, display_order, enabled, id } = body;

    // 1. Mandatory Validations
    if (!platform || typeof platform !== 'string' || !platform.trim()) {
      return NextResponse.json(
        { error: 'Platform name is required.' },
        { status: 400 }
      );
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Social URL is required.' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid URL (e.g. https://... or mailto:...).' },
        { status: 400 }
      );
    }

    const payload: Partial<SocialLinkItem> = {
      id: id || undefined,
      platform: platform.trim(),
      label: label?.trim() || platform.trim(),
      url: url.trim(),
      icon: icon?.trim() || undefined,
      display_order: typeof display_order === 'number' ? display_order : undefined,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
    };

    const saved = await AdminService.upsertSocialLink(payload);

    // Revalidate paths
    try {
      revalidatePath('/');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: id ? 'Social link updated successfully.' : 'Social link added successfully.',
      socialLink: saved,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save social link';
    console.error('[POST /api/admin/social] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while saving social link.' },
      { status: 500 }
    );
  }
}
