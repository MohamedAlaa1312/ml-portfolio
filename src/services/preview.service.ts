import { CmsService } from './cms.service';
import { AdminService } from './admin.service';
import { DevFallbackStore } from '@/lib/store';
import type {
  SiteSettings,
  Section,
  Project,
  Skill,
  Experience,
  Certification,
  SocialLinkItem,
  CmsDraft,
} from '@/lib/supabase/types';
import { parseSocialLinks } from '@/lib/social-utils';

export interface PreviewData {
  siteSettings: SiteSettings | null;
  sections: Section[];
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  certifications: Certification[];
  socialLinks: SocialLinkItem[];
  drafts: CmsDraft[];
  draftCount: number;
}

/**
 * Preview Service (Phase 13: Draft / Preview / Publish Workflow)
 * Responsible for synthesizing an authenticated preview state:
 * - Overlays active drafts and draft-status records onto the baseline published content
 * - Gracefully falls back to currently published content where no draft exists
 * - Strictly guarded for authorized administrators only
 */
export const PreviewService = {
  async getPreviewData(): Promise<PreviewData> {
    // 1. Fetch baseline published content and all active drafts
    const [
      publishedSettings,
      publishedSections,
      publishedProjects,
      publishedSkills,
      publishedExperience,
      publishedCerts,
      drafts,
      allDbProjects,
      allDbExperience,
      allDbCerts,
      allDbSections,
    ] = await Promise.all([
      CmsService.getSiteSettings().catch(() => null),
      CmsService.getPublishedSections().catch(() => []),
      CmsService.getPublishedProjects().catch(() => []),
      CmsService.getEnabledSkills().catch(() => []),
      CmsService.getPublishedExperience().catch(() => []),
      CmsService.getPublishedCertifications().catch(() => []),
      AdminService.getAllDrafts().catch(() => []),
      AdminService.getAllProjects().catch(() => []),
      AdminService.getAllExperience().catch(() => []),
      AdminService.getAllCertifications().catch(() => []),
      AdminService.getAllSections().catch(() => []),
    ]);

    // 2. Synthesize Site Settings with Draft Overlay
    let siteSettings: SiteSettings | null = publishedSettings ? { ...publishedSettings } : null;
    const settingsDraft = drafts.find((d) => d.entity_type === 'site_settings');
    if (settingsDraft && siteSettings) {
      siteSettings = {
        ...siteSettings,
        ...settingsDraft.data,
      };
    } else if (settingsDraft && !siteSettings) {
      siteSettings = { ...(settingsDraft.data as unknown as SiteSettings) };
    }

    const themeDraft = drafts.find((d) => d.entity_type === 'theme');
    if (themeDraft && themeDraft.data?.active_theme) {
      if (siteSettings) {
        siteSettings = {
          ...siteSettings,
          active_theme: themeDraft.data.active_theme,
        };
      } else {
        siteSettings = { active_theme: themeDraft.data.active_theme } as unknown as SiteSettings;
      }
    }

    // 3. Synthesize Sections with Draft Overlay (Cloning items to protect store baseline)
    const sections: Section[] = allDbSections.map((s) => ({
      ...s,
      content: typeof s.content === 'object' && s.content !== null ? { ...s.content } : s.content,
    }));

    // Check for sections_order draft
    const sectionsOrderDraft = drafts.find((d) => d.entity_type === 'sections_order');
    if (sectionsOrderDraft) {
      const { orderedIds, enabledMap } = sectionsOrderDraft.data;
      if (Array.isArray(orderedIds)) {
        orderedIds.forEach((id: string, index: number) => {
          const sec = sections.find((s) => s.id === id || s.slug === id);
          if (sec) {
            sec.display_order = index + 1;
          }
        });
        sections.sort((a, b) => a.display_order - b.display_order);
      }
      if (enabledMap && typeof enabledMap === 'object') {
        sections.forEach((sec) => {
          if (sec.id in enabledMap) {
            sec.enabled = Boolean(enabledMap[sec.id]);
          } else if (sec.slug in enabledMap) {
            sec.enabled = Boolean(enabledMap[sec.slug]);
          }
        });
      }
    }

    // Overlay individual section drafts
    const sectionDrafts = drafts.filter((d) => d.entity_type === 'section');
    sectionDrafts.forEach((sd) => {
      const idx = sections.findIndex((s) => s.id === sd.entity_id || s.slug === sd.entity_id);
      if (idx >= 0) {
        sections[idx] = {
          ...sections[idx],
          ...sd.data,
        };
      }
    });

    // In preview mode: Filter out disabled sections and archived sections (draft and published are previewable!)
    const previewSections = sections
      .filter((s) => s.enabled && s.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);

    // 4. Synthesize Projects with Draft Overlay
    const projectsMap = new Map<string, Project>();
    // Baseline: published projects
    publishedProjects.forEach((p) => projectsMap.set(p.id, { ...p }));

    // Include any database projects with status === 'draft'
    allDbProjects
      .filter((p) => p.status === 'draft')
      .forEach((p) => projectsMap.set(p.id, { ...p }));

    // Overlay active project drafts
    const projectDrafts = drafts.filter((d) => d.entity_type === 'project');
    projectDrafts.forEach((pd) => {
      const existing = projectsMap.get(pd.entity_id) || allDbProjects.find((p) => p.id === pd.entity_id);
      if (existing) {
        projectsMap.set(pd.entity_id, {
          ...existing,
          ...pd.data,
          status: 'draft',
        });
      } else {
        projectsMap.set(pd.entity_id, {
          id: pd.entity_id,
          title: pd.data.title || 'Draft Project',
          slug: pd.data.slug || `draft-proj-${Date.now()}`,
          short_description: pd.data.short_description || '',
          full_description: pd.data.full_description || '',
          gallery_urls: pd.data.gallery_urls || [],
          technologies: pd.data.technologies || [],
          featured: Boolean(pd.data.featured),
          display_order: Number(pd.data.display_order) || 99,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...pd.data,
        } as Project);
      }
    });

    const previewProjects = Array.from(projectsMap.values())
      .filter((p) => (p.enabled !== false) && p.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);

    // 5. Synthesize Experience with Draft Overlay
    const expMap = new Map<string, Experience>();
    publishedExperience.forEach((e) => expMap.set(e.id, { ...e }));
    allDbExperience
      .filter((e) => e.status === 'draft')
      .forEach((e) => expMap.set(e.id, { ...e }));

    const expDrafts = drafts.filter((d) => d.entity_type === 'experience');
    expDrafts.forEach((ed) => {
      const existing = expMap.get(ed.entity_id) || allDbExperience.find((e) => e.id === ed.entity_id);
      if (existing) {
        expMap.set(ed.entity_id, {
          ...existing,
          ...ed.data,
          status: 'draft',
        });
      } else {
        expMap.set(ed.entity_id, {
          id: ed.entity_id,
          company: ed.data.company || 'Draft Company',
          role: ed.data.role || 'Draft Role',
          employment_type: ed.data.employment_type || 'Full-time',
          location: ed.data.location || 'Remote',
          start_date: ed.data.start_date || new Date().toISOString().substring(0, 10),
          is_current: Boolean(ed.data.is_current),
          description: ed.data.description || '',
          responsibilities: ed.data.responsibilities || [],
          technologies: ed.data.technologies || [],
          achievements: ed.data.achievements || [],
          display_order: Number(ed.data.display_order) || 99,
          enabled: true,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...ed.data,
        } as Experience);
      }
    });

    const previewExperience = Array.from(expMap.values())
      .filter((e) => e.enabled && e.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);

    // 6. Synthesize Certifications with Draft Overlay
    const certsMap = new Map<string, Certification>();
    publishedCerts.forEach((c) => certsMap.set(c.id, { ...c }));
    allDbCerts
      .filter((c) => c.status === 'draft')
      .forEach((c) => certsMap.set(c.id, { ...c }));

    const certDrafts = drafts.filter((d) => d.entity_type === 'certification');
    certDrafts.forEach((cd) => {
      const existing = certsMap.get(cd.entity_id) || allDbCerts.find((c) => c.id === cd.entity_id);
      if (existing) {
        certsMap.set(cd.entity_id, {
          ...existing,
          ...cd.data,
          status: 'draft',
        });
      } else {
        certsMap.set(cd.entity_id, {
          id: cd.entity_id,
          title: cd.data.title || 'Draft Certification',
          issuer: cd.data.issuer || 'Draft Issuer',
          issue_date: cd.data.issue_date || new Date().toISOString().substring(0, 10),
          description: cd.data.description || '',
          display_order: Number(cd.data.display_order) || 99,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...cd.data,
        } as Certification);
      }
    });

    const previewCertifications = Array.from(certsMap.values())
      .filter((c) => (c.enabled !== false) && c.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);

    // 7. Synthesize Skills with Draft Overlay
    const previewSkills = [...publishedSkills];
    const skillDrafts = drafts.filter((d) => d.entity_type === 'skill');
    skillDrafts.forEach((sd) => {
      const idx = previewSkills.findIndex((s) => s.id === sd.entity_id);
      if (idx >= 0) {
        previewSkills[idx] = {
          ...previewSkills[idx],
          ...sd.data,
        };
      }
    });

    // 8. Synthesize Social Links with Draft Overlay
    const allSocial = parseSocialLinks(siteSettings?.social_links);
    const previewSocialLinks = allSocial
      .filter((s) => s.enabled && s.status !== 'archived')
      .sort((a, b) => a.display_order - b.display_order);

    return {
      siteSettings,
      sections: previewSections,
      projects: previewProjects,
      skills: previewSkills,
      experience: previewExperience,
      certifications: previewCertifications,
      socialLinks: previewSocialLinks,
      drafts,
      draftCount: drafts.length,
    };
  },
};
