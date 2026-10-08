import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import { CmsService } from '@/services/cms.service';
import type { SiteSettings, Section, HeroContent, SocialLinkItem } from '@/lib/supabase/types';
import { parseSocialLinks, getPlatformIcon } from '@/lib/social-utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/profile
 * Retrieves current site settings and hero section content for the admin editor.
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
    const [siteSettings, sections] = await Promise.all([
      AdminService.getSiteSettings(),
      AdminService.getAllSections().catch(() => [] as Section[]),
    ]);

    const heroSection = sections.find((s) => s.type === 'hero' || s.slug === 'hero') || null;

    return NextResponse.json({
      success: true,
      siteSettings,
      heroSection,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch profile settings';
    console.error('[GET /api/admin/profile] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading profile configuration.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/profile
 * Updates site settings and hero dynamic section.
 * Revalidates public pages ('/' and '/admin/profile').
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
    const { profile, hero } = body;

    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid payload: profile data is required.' },
        { status: 400 }
      );
    }

    // 1. Validate mandatory fields
    if (!profile.name || typeof profile.name !== 'string' || !profile.name.trim()) {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!profile.professional_title || typeof profile.professional_title !== 'string' || !profile.professional_title.trim()) {
      return NextResponse.json(
        { error: 'Professional title is required.' },
        { status: 400 }
      );
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 2. Prepare Site Settings Payload
    const siteSettingsPayload: Partial<SiteSettings> = {
      name: profile.name.trim(),
      title: profile.professional_title.trim(),
      professional_title: profile.professional_title.trim(),
      subtitle: profile.subtitle?.trim() || '',
      bio: profile.bio?.trim() || '',
      email: profile.email?.trim() || '',
      phone: profile.phone?.trim() || null,
      location: profile.location?.trim() || '',
      profile_image: profile.profile_image || null,
      profile_image_url: profile.profile_image_url || profile.profile_image || null,
      resume_url: profile.resume_url?.trim() || null,
    };

    // Centralized authoritative social links management
    if (profile.social_links) {
      if (Array.isArray(profile.social_links)) {
        siteSettingsPayload.social_links = profile.social_links;
      } else {
        const currentSocials = await AdminService.getSocialLinks();
        const updatedSocials = [...currentSocials];

        const updateOrAdd = (platform: string, urlVal?: string) => {
          if (!urlVal) return;
          const idx = updatedSocials.findIndex(
            (s) => s.platform.toLowerCase() === platform.toLowerCase()
          );
          if (idx >= 0) {
            updatedSocials[idx] = { ...updatedSocials[idx], url: urlVal.trim() };
          } else {
            updatedSocials.push({
              id: `soc-${platform.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              platform,
              label: platform,
              url: urlVal.trim(),
              icon: getPlatformIcon(platform),
              display_order: updatedSocials.length + 1,
              enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        };

        if (profile.social_links.linkedin) updateOrAdd('LinkedIn', profile.social_links.linkedin);
        if (profile.social_links.github) updateOrAdd('GitHub', profile.social_links.github);
        if (profile.social_links.x) updateOrAdd('X / Twitter', profile.social_links.x);
        if (profile.social_links.email) updateOrAdd('Email', profile.social_links.email);

        siteSettingsPayload.social_links = updatedSocials;
      }
    }

    // Keep hero_title and hero_subtitle synchronized in site_settings
    siteSettingsPayload.hero_title = profile.name.trim();
    siteSettingsPayload.hero_subtitle = profile.professional_title.trim();

    // 3. Update Site Settings in Database
    let updatedSettings: SiteSettings | null = null;
    try {
      updatedSettings = await AdminService.updateSiteSettings(siteSettingsPayload);
    } catch (err: unknown) {
      console.warn('[AdminService.updateSiteSettings] DB write warning:', err);
    }

    // 4. Update Hero Dynamic Section if hero data is provided
    let updatedHeroSection: Section | null = null;
    if (hero) {
      const heroContent: HeroContent = {
        greeting: hero.greeting?.trim() || "Hello, I'm",
        badge: profile.professional_title.trim(),
        summary: hero.summary?.trim() || profile.bio?.trim() || '',
        primaryCta: {
          label: hero.primaryCta?.label?.trim() || 'View My Projects',
          anchor: hero.primaryCta?.anchor?.trim() || '#projects',
        },
        secondaryCta: {
          label: hero.secondaryCta?.label?.trim() || 'Contact Me',
          anchor: hero.secondaryCta?.anchor?.trim() || '#contact',
        },
      };

      try {
        const sections = await AdminService.getAllSections().catch(() => [] as Section[]);
        const existingHero = sections.find((s) => s.type === 'hero' || s.slug === 'hero');

        const sectionData: Partial<Section> & { slug: string } = {
          id: existingHero?.id,
          type: 'hero',
          title: 'Hero Section',
          slug: 'hero',
          content: heroContent as any,
          display_order: existingHero?.display_order || 1,
          enabled: true,
          status: 'published',
        };

        updatedHeroSection = await AdminService.upsertSection(sectionData);
      } catch (err: unknown) {
        console.warn('[AdminService.upsertSection] Hero section write warning:', err);
      }
    }

    // 5. Revalidate public cache for instant updates
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/profile');
      revalidatePath('/admin/dashboard');
    } catch {
      // Revalidation is non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Profile and Hero updated successfully.',
      siteSettings: updatedSettings || siteSettingsPayload,
      heroSection: updatedHeroSection,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
    console.error('[POST /api/admin/profile] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to save changes. Please verify your connection and try again.' },
      { status: 500 }
    );
  }
}
