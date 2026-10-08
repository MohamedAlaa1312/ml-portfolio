import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { SiteSettings } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_THEMES = new Set(['dark', 'system']);
const VALID_ACCENTS = new Set(['amber', 'emerald', 'cyan', 'indigo']);

/**
 * Validates whether a given string is a syntactically valid HTTP/HTTPS URL.
 */
function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/settings
 * Retrieves authoritative global website settings for the settings CMS editor.
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
    const settings = await AdminService.getSiteSettings();
    if (!settings) {
      return NextResponse.json(
        { error: 'Site settings record not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve settings';
    console.error('[GET /api/admin/settings] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading settings.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Updates global site settings with validation and cache revalidation.
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
    const settingsInput = body.settings || body;

    if (!settingsInput || typeof settingsInput !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload: settings object is required.' },
        { status: 400 }
      );
    }

    // 1. Validate site_name if provided
    if (settingsInput.site_name !== undefined) {
      if (typeof settingsInput.site_name !== 'string' || !settingsInput.site_name.trim()) {
        return NextResponse.json(
          { error: 'Site name cannot be empty.' },
          { status: 400 }
        );
      }
    }

    // 2. Validate canonical_url if provided
    if (settingsInput.canonical_url !== undefined && settingsInput.canonical_url !== null && settingsInput.canonical_url.trim()) {
      if (!isValidHttpUrl(settingsInput.canonical_url.trim())) {
        return NextResponse.json(
          { error: 'Please enter a valid Canonical / Site URL (e.g. https://example.com).' },
          { status: 400 }
        );
      }
    }

    // 3. Validate theme_preference if provided
    if (settingsInput.theme_preference !== undefined) {
      if (!VALID_THEMES.has(settingsInput.theme_preference)) {
        return NextResponse.json(
          { error: `Invalid theme preference. Allowed: ${Array.from(VALID_THEMES).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 4. Validate accent_color if provided
    if (settingsInput.accent_color !== undefined) {
      if (!VALID_ACCENTS.has(settingsInput.accent_color)) {
        return NextResponse.json(
          { error: `Invalid accent color. Allowed: ${Array.from(VALID_ACCENTS).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 5. Validate default_items_per_page if provided
    if (settingsInput.default_items_per_page !== undefined) {
      const num = Number(settingsInput.default_items_per_page);
      if (isNaN(num) || num < 1 || num > 100) {
        return NextResponse.json(
          { error: 'Default items per page must be a number between 1 and 100.' },
          { status: 400 }
        );
      }
    }

    // 6. Whitelist allowed fields to prevent arbitrary secret injection
    const allowedPayload: Partial<SiteSettings> = {};

    // General
    if (settingsInput.site_name !== undefined) allowedPayload.site_name = settingsInput.site_name.trim();
    if (settingsInput.site_description !== undefined) allowedPayload.site_description = settingsInput.site_description.trim();
    if (settingsInput.default_language !== undefined) allowedPayload.default_language = settingsInput.default_language.trim();
    if (settingsInput.timezone !== undefined) allowedPayload.timezone = settingsInput.timezone.trim();
    if (settingsInput.logo !== undefined) allowedPayload.logo = settingsInput.logo;
    if (settingsInput.logo_url !== undefined) allowedPayload.logo_url = settingsInput.logo_url;
    if (settingsInput.favicon !== undefined) allowedPayload.favicon = settingsInput.favicon;
    if (settingsInput.favicon_url !== undefined) allowedPayload.favicon_url = settingsInput.favicon_url;
    if (settingsInput.resume !== undefined) allowedPayload.resume = settingsInput.resume;
    if (settingsInput.resume_url !== undefined) allowedPayload.resume_url = settingsInput.resume_url;

    // SEO
    if (settingsInput.seo_title !== undefined) allowedPayload.seo_title = settingsInput.seo_title.trim();
    if (settingsInput.seo_description !== undefined) allowedPayload.seo_description = settingsInput.seo_description.trim();
    if (settingsInput.og_image !== undefined) allowedPayload.og_image = settingsInput.og_image;
    if (settingsInput.og_image_url !== undefined) allowedPayload.og_image_url = settingsInput.og_image_url;
    if (settingsInput.canonical_url !== undefined) allowedPayload.canonical_url = settingsInput.canonical_url?.trim() || '';
    if (settingsInput.allow_indexing !== undefined) allowedPayload.allow_indexing = Boolean(settingsInput.allow_indexing);

    // Appearance
    if (settingsInput.theme_preference !== undefined) allowedPayload.theme_preference = settingsInput.theme_preference;
    if (settingsInput.accent_color !== undefined) allowedPayload.accent_color = settingsInput.accent_color;

    // System
    if (settingsInput.default_items_per_page !== undefined) allowedPayload.default_items_per_page = Number(settingsInput.default_items_per_page);
    if (settingsInput.enable_contact_form !== undefined) allowedPayload.enable_contact_form = Boolean(settingsInput.enable_contact_form);
    if (settingsInput.analytics_enabled !== undefined) allowedPayload.analytics_enabled = Boolean(settingsInput.analytics_enabled);

    // 7. Persist settings
    const updated = await AdminService.updateSiteSettings(allowedPayload);

    // 8. Revalidate public and admin paths
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      revalidatePath('/admin/dashboard');
    } catch {
      // Revalidation is non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Global settings updated successfully.',
      settings: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    console.error('[POST /api/admin/settings] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating settings.' },
      { status: 500 }
    );
  }
}

export { POST as PATCH };
