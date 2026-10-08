import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { CmsService } from '@/services/cms.service';
import { isValidEmail, isValidUrl } from '@/lib/social-utils';
import type { ContactContent, PublishStatus, Section, SiteSettings } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: PublishStatus[] = ['draft', 'published', 'archived'];

/**
 * GET /api/admin/contact
 * Retrieves current contact details, contact section content, and social links.
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
    const [siteSettings, contactSection, socialLinks] = await Promise.all([
      AdminService.getSiteSettings(),
      AdminService.getContactSection(),
      AdminService.getSocialLinks(),
    ]);

    return NextResponse.json({
      success: true,
      siteSettings,
      contactSection,
      socialLinks,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch contact settings';
    console.error('[GET /api/admin/contact] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading contact configuration.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/contact
 * Updates contact information in site_settings and contact section in dynamic sections.
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
    const { contactInfo, sectionContent } = body;

    // 1. Validate Email (if provided)
    if (contactInfo?.email !== undefined && contactInfo.email !== null) {
      const emailTrimmed = String(contactInfo.email).trim();
      if (emailTrimmed && !isValidEmail(emailTrimmed)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
    }

    // 2. Validate CTA Link (if provided)
    if (sectionContent?.ctaUrl) {
      const ctaUrlTrimmed = String(sectionContent.ctaUrl).trim();
      if (ctaUrlTrimmed && !isValidUrl(ctaUrlTrimmed)) {
        return NextResponse.json(
          { error: 'Please enter a valid CTA URL (e.g. https://... or mailto:...).' },
          { status: 400 }
        );
      }
    }

    // 3. Validate Status (if provided)
    if (sectionContent?.status && !VALID_STATUSES.includes(sectionContent.status)) {
      return NextResponse.json(
        { error: 'Invalid section status. Must be draft, published, or archived.' },
        { status: 400 }
      );
    }

    // 4. Update Site Settings (email, phone, location)
    let updatedSettings: SiteSettings | null = null;
    if (contactInfo) {
      const currentSettings = await AdminService.getSiteSettings();
      const payload: Partial<SiteSettings> = {
        id: currentSettings?.id,
      };

      if (contactInfo.email !== undefined) {
        payload.email = String(contactInfo.email).trim();
      }
      if (contactInfo.phone !== undefined) {
        payload.phone = contactInfo.phone ? String(contactInfo.phone).trim() : null;
      }
      if (contactInfo.location !== undefined) {
        payload.location = contactInfo.location ? String(contactInfo.location).trim() : '';
      }

      updatedSettings = await AdminService.updateSiteSettings(payload);
    }

    // 5. Update Contact Dynamic Section (title, badge, subtitle, description, cta, availability, enabled, status)
    let updatedSection: Section | null = null;
    if (sectionContent) {
      const existingSection = await AdminService.getContactSection();
      const existingContent = (existingSection?.content as ContactContent) || {};

      const contentPayload: ContactContent = {
        ...existingContent,
        badge: sectionContent.badge !== undefined ? String(sectionContent.badge).trim() : existingContent.badge || 'Contact',
        title: sectionContent.title !== undefined ? String(sectionContent.title).trim() : existingContent.title || 'Get In Touch',
        subtitle: sectionContent.subtitle !== undefined ? String(sectionContent.subtitle).trim() : existingContent.subtitle || '',
        description: sectionContent.description !== undefined ? String(sectionContent.description).trim() : existingContent.description || '',
        ctaText: sectionContent.ctaText !== undefined ? String(sectionContent.ctaText).trim() : existingContent.ctaText || '',
        ctaUrl: sectionContent.ctaUrl !== undefined ? String(sectionContent.ctaUrl).trim() : existingContent.ctaUrl || '',
        availabilityText: sectionContent.availabilityText !== undefined ? String(sectionContent.availabilityText).trim() : existingContent.availabilityText || '',
        submitButtonText: sectionContent.submitButtonText !== undefined ? String(sectionContent.submitButtonText).trim() : existingContent.submitButtonText || 'Send Message',
        successMessage: sectionContent.successMessage !== undefined ? String(sectionContent.successMessage).trim() : existingContent.successMessage || 'Thank you for reaching out!',
      };

      const sectionPayload: Partial<Section> & { slug: string } = {
        id: existingSection?.id,
        type: 'contact',
        title: contentPayload.title || 'Get In Touch',
        slug: 'contact',
        content: contentPayload,
        display_order: existingSection?.display_order || 7,
        enabled: sectionContent.enabled !== undefined ? Boolean(sectionContent.enabled) : (existingSection?.enabled ?? true),
        status: sectionContent.status || existingSection?.status || 'published',
      };

      updatedSection = await AdminService.upsertSection(sectionPayload);
    }

    // 6. Cache Revalidation
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/contact');
      revalidatePath('/admin/profile');
    } catch {
      // Non-blocking in non-Next runtime
    }

    return NextResponse.json({
      success: true,
      message: 'Contact information updated successfully.',
      siteSettings: updatedSettings,
      contactSection: updatedSection,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update contact settings';
    console.error('[POST /api/admin/contact] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while saving contact settings.' },
      { status: 500 }
    );
  }
}
