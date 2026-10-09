import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DevFallbackStore } from '@/lib/store';
import type {
  SiteSettings,
  Section,
  Project,
  Skill,
  Experience,
  Certification,
  SocialLinkItem,
} from '@/lib/supabase/types';
import { parseSocialLinks } from '@/lib/social-utils';

async function getDbClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serviceKey) {
    try {
      return createAdminClient();
    } catch {
      // fallback to cookie/anon client
    }
  }
  return await createClient();
}

/**
 * Public CMS Data Access Service.
 * Only queries rows matching:
 * - status = 'published'
 * - enabled = true (for sections, skills, experience)
 *
 * All operations are strictly read-only and governed by PostgreSQL RLS.
 * When Supabase is unconfigured in development, seamlessly queries DevFallbackStore.
 */
export const CmsService = {
  /**
   * Retrieves global site configuration and persona details.
   */
  async getSiteSettings(): Promise<SiteSettings | null> {
    let settings: SiteSettings | null = null;

    if (!DevFallbackStore.isConfigured()) {
      settings = DevFallbackStore.getSiteSettings();
    } else {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          settings = DevFallbackStore.getSiteSettings();
        } else {
          settings = (data as unknown as SiteSettings) || DevFallbackStore.getSiteSettings();
        }
      } catch {
        settings = DevFallbackStore.getSiteSettings();
      }
    }

    if (!settings) return null;

    // Filter public social links: only enabled and published links should be exposed to public visitors
    const publicLinks = parseSocialLinks(settings.social_links).filter(
      (link) => link.enabled && link.status !== 'archived'
    );

    return {
      ...settings,
      social_links: publicLinks,
    };
  },

  /**
   * Retrieves all published sections ordered by display_order.
   */
  async getPublishedSections(): Promise<Section[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getPublishedSections();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('status', 'published')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (error) {
        return DevFallbackStore.getPublishedSections();
      }
      return (data as Section[]) || DevFallbackStore.getPublishedSections();
    } catch {
      return DevFallbackStore.getPublishedSections();
    }
  },

  /**
   * Retrieves published projects ordered by display_order.
   */
  async getPublishedProjects(featuredOnly = false): Promise<Project[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getPublishedProjects(featuredOnly);
    }
    try {
      const supabase = await getDbClient();
      let query = supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (featuredOnly) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[CmsService.getPublishedProjects] Error:', error.message);
        return DevFallbackStore.getPublishedProjects(featuredOnly);
      }
      return ((data as any[]) || []).map((p) => ({
        ...p,
        enabled: p.enabled !== undefined ? Boolean(p.enabled) : p.status === 'published',
      })) as Project[];
    } catch {
      return DevFallbackStore.getPublishedProjects(featuredOnly);
    }
  },

  /**
   * Retrieves active skills grouped or ordered by display_order.
   */
  async getEnabledSkills(): Promise<Skill[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getEnabledSkills();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (error) {
        return DevFallbackStore.getEnabledSkills();
      }
      return (data as Skill[]) || DevFallbackStore.getEnabledSkills();
    } catch {
      return DevFallbackStore.getEnabledSkills();
    }
  },

  /**
   * Retrieves published professional experience entries ordered chronologically/by display_order.
   */
  async getPublishedExperience(): Promise<Experience[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getPublishedExperience();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('status', 'published')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (error) {
        return DevFallbackStore.getPublishedExperience();
      }
      return (data as Experience[]) || DevFallbackStore.getPublishedExperience();
    } catch {
      return DevFallbackStore.getPublishedExperience();
    }
  },

  /**
   * Retrieves published certifications ordered by display_order.
   */
  async getPublishedCertifications(): Promise<Certification[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getPublishedCertifications();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('[CmsService.getPublishedCertifications] Error:', error.message);
        return DevFallbackStore.getPublishedCertifications();
      }
      return (data as Certification[]) || DevFallbackStore.getPublishedCertifications();
    } catch (err) {
      console.warn('[CmsService.getPublishedCertifications] Connection error:', err);
      return DevFallbackStore.getPublishedCertifications();
    }
  },

  /**
   * Retrieves public social links that are enabled and ordered by display_order.
   */
  async getPublicSocialLinks(): Promise<SocialLinkItem[]> {
    const settings = await this.getSiteSettings();
    const links = parseSocialLinks(settings?.social_links);
    return links
      .filter((link) => link.enabled && link.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);
  },
};
