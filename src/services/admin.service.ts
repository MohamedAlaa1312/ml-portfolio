import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DevFallbackStore } from '@/lib/store';
import fs from 'fs';
import path from 'path';
import type {
  Section,
  Project,
  Skill,
  SkillCategory,
  Experience,
  Certification,
  SiteSettings,
  MediaItem,
  MediaUsageReference,
  MediaItemWithUsage,
  SocialLinkItem,
  ContactContent,
  CmsDraft,
  DraftEntityType,
  PublishStatus,
} from '@/lib/supabase/types';
import { parseSocialLinks } from '@/lib/social-utils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id?: string | null): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Resolves the database client for admin operations.
 * Prioritizes createAdminClient() (Service Role) when configured on the server,
 * safely bypassing RLS for authenticated administrative actions.
 * Falls back to createClient() (user session cookie).
 */
async function getDbClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serviceKey) {
    try {
      return createAdminClient();
    } catch (err) {
      console.warn('[AdminService] createAdminClient fallback notice:', err);
    }
  }
  return await createClient();
}

/**
 * Server-Side Administrative Data Management Service.
 * All mutations require an authenticated session and are guarded by PostgreSQL RLS.
 * When Supabase is unconfigured, operates seamlessly via DevFallbackStore.
 */
export const AdminService = {
  // ----------------------------------------------------------------------------
  // SECTIONS
  // ----------------------------------------------------------------------------
  async getAllSections(): Promise<Section[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllSections();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AdminService.getAllSections] DB error:', error.message);
        return DevFallbackStore.getAllSections();
      }
      if (Array.isArray(data) && data.length > 0) {
        return data as Section[];
      }
      return DevFallbackStore.getAllSections();
    } catch (err) {
      console.error('[AdminService.getAllSections] Exception:', err);
      return DevFallbackStore.getAllSections();
    }
  },

  async getSectionById(id: string): Promise<Section | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getSectionById(id);
    }
    try {
      const supabase = await getDbClient();
      let query = supabase.from('sections').select('*');
      if (isValidUuid(id)) {
        query = query.or(`id.eq.${id},slug.eq.${id}`);
      } else {
        query = query.eq('slug', id);
      }
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('[AdminService.getSectionById] DB error:', error.message);
        return DevFallbackStore.getSectionById(id);
      }
      return (data as unknown as Section) || DevFallbackStore.getSectionById(id);
    } catch (err) {
      console.error('[AdminService.getSectionById] Exception:', err);
      return DevFallbackStore.getSectionById(id);
    }
  },

  async upsertSection(section: Partial<Section> & { slug: string }): Promise<Section> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertSection(section);
    }
    try {
      const supabase = await getDbClient();

      // Check for existing section by valid UUID or by slug
      let existingQuery = supabase.from('sections').select('id, slug').limit(1);
      if (isValidUuid(section.id)) {
        existingQuery = existingQuery.or(`id.eq.${section.id},slug.eq.${section.slug}`);
      } else {
        existingQuery = existingQuery.eq('slug', section.slug);
      }
      const { data: existingData } = await existingQuery.maybeSingle();
      const existing = existingData as any;

      const payload: any = {
        ...section,
        updated_at: new Date().toISOString(),
      };
      if (!isValidUuid(payload.id)) {
        delete payload.id;
      }

      let res;
      if (existing?.id) {
        const updatePayload = { ...payload };
        delete updatePayload.id;
        res = await (supabase as any)
          .from('sections')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        res = await (supabase as any)
          .from('sections')
          .insert(payload)
          .select()
          .single();
      }

      if (res.error) {
        console.error('[AdminService.upsertSection] DB error:', res.error.message);
        throw new Error(res.error.message);
      }
      const resultData = res.data as Section;
      DevFallbackStore.upsertSection(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.upsertSection] Fatal error:', err);
      return DevFallbackStore.upsertSection(section);
    }
  },

  async updateSection(id: string, updates: Partial<Section>): Promise<Section | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.updateSection(id, updates);
    }
    try {
      const supabase = await getDbClient();
      const cleanUpdates: any = { ...updates, updated_at: new Date().toISOString() };
      delete cleanUpdates.id;

      let query = (supabase as any)
        .from('sections')
        .update(cleanUpdates);

      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      const { data, error } = await query.select().maybeSingle();

      if (error) {
        console.error('[AdminService.updateSection] DB error:', error.message);
        return DevFallbackStore.updateSection(id, updates);
      }
      if (data) {
        const res = data as Section;
        DevFallbackStore.updateSection(res.id, updates);
        return res;
      }
      return DevFallbackStore.updateSection(id, updates);
    } catch (err) {
      console.error('[AdminService.updateSection] Exception:', err);
      return DevFallbackStore.updateSection(id, updates);
    }
  },

  async toggleSection(id: string, enabled?: boolean): Promise<Section | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.toggleSection(id, enabled);
    }
    try {
      const current = await this.getSectionById(id);
      if (!current) return null;
      const targetEnabled = enabled !== undefined ? enabled : !current.enabled;
      return await this.updateSection(id, { enabled: targetEnabled });
    } catch (err) {
      console.error('[AdminService.toggleSection] Exception:', err);
      return DevFallbackStore.toggleSection(id, enabled);
    }
  },

  async deleteSection(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteSection(id);
      return;
    }
    try {
      const supabase = await getDbClient();
      let query = supabase.from('sections').delete();
      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      const { error } = await query;
      if (error) console.error('[AdminService.deleteSection] DB error:', error.message);
      DevFallbackStore.deleteSection(id);
    } catch (err) {
      console.error('[AdminService.deleteSection] Exception:', err);
      DevFallbackStore.deleteSection(id);
    }
  },

  async reorderSections(orderedIds: string[]): Promise<Section[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.reorderSections(orderedIds);
    }
    try {
      const supabase = await getDbClient();
      const updates = orderedIds.map((id, index) => {
        let q = (supabase as any).from('sections').update({ display_order: index + 1 });
        if (isValidUuid(id)) {
          return q.eq('id', id);
        } else {
          return q.eq('slug', id);
        }
      });
      await Promise.all(updates);
      return this.getAllSections();
    } catch (err) {
      console.error('[AdminService.reorderSections] Exception:', err);
      return DevFallbackStore.reorderSections(orderedIds);
    }
  },

  // ----------------------------------------------------------------------------
  // PROJECTS
  // ----------------------------------------------------------------------------
  async getAllProjects(): Promise<Project[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllProjects();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AdminService.getAllProjects] DB error:', error.message);
        return DevFallbackStore.getAllProjects();
      }
      if (Array.isArray(data) && data.length > 0) {
        return (data as any[]).map((p) => ({
          ...p,
          enabled: p.enabled !== undefined ? Boolean(p.enabled) : p.status === 'published',
        })) as Project[];
      }
      return DevFallbackStore.getAllProjects();
    } catch (err) {
      console.error('[AdminService.getAllProjects] Exception:', err);
      return DevFallbackStore.getAllProjects();
    }
  },

  async getProjectById(id: string): Promise<Project | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getProjectById(id);
    }
    try {
      const supabase = await getDbClient();
      let query = supabase.from('projects').select('*');
      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('[AdminService.getProjectById] DB error:', error.message);
        return DevFallbackStore.getProjectById(id);
      }
      if (data) {
        const p = data as any;
        return {
          ...p,
          enabled: p.enabled !== undefined ? Boolean(p.enabled) : p.status === 'published',
        } as Project;
      }
      return DevFallbackStore.getProjectById(id);
    } catch (err) {
      console.error('[AdminService.getProjectById] Exception:', err);
      return DevFallbackStore.getProjectById(id);
    }
  },

  async upsertProject(project: Partial<Project>): Promise<Project> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertProject(project);
    }
    try {
      const supabase = await getDbClient();
      const payload: any = { ...project };

      if (!payload.slug && payload.title) {
        payload.slug = payload.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Check for existing project by UUID or slug
      let existing: any = null;
      if (isValidUuid(payload.id)) {
        const { data } = await supabase
          .from('projects')
          .select('id, slug')
          .eq('id', payload.id)
          .maybeSingle();
        existing = data;
      } else if (payload.slug) {
        const { data } = await supabase
          .from('projects')
          .select('id, slug')
          .eq('slug', payload.slug)
          .maybeSingle();
        existing = data;
      }

      // Authoritative status resolution: map enabled boolean to publish_status enum
      let finalStatus: PublishStatus = payload.status || 'published';
      if (payload.enabled === false) {
        finalStatus = finalStatus === 'archived' ? 'archived' : 'draft';
      } else if (payload.enabled === true && finalStatus === 'draft') {
        finalStatus = 'published';
      }

      const galleryUrls = Array.isArray(payload.gallery_urls)
        ? payload.gallery_urls
        : Array.isArray(payload.gallery)
        ? payload.gallery
        : [];

      // Build clean database payload strictly matching columns in PostgreSQL `projects` table
      const dbPayload: Record<string, any> = {
        title: payload.title?.trim() ?? 'Untitled Project',
        slug: payload.slug?.trim() || `project-${Date.now()}`,
        short_description: payload.short_description?.trim() ?? '',
        full_description: payload.full_description?.trim() ?? '',
        thumbnail: payload.thumbnail_url ?? payload.thumbnail ?? null,
        thumbnail_url: payload.thumbnail_url ?? payload.thumbnail ?? null,
        gallery: galleryUrls,
        gallery_urls: galleryUrls,
        technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
        github_url: payload.github_url ? payload.github_url.trim() : null,
        live_url: payload.live_url ? payload.live_url.trim() : null,
        featured: Boolean(payload.featured),
        display_order: typeof payload.display_order === 'number' ? payload.display_order : 0,
        status: finalStatus,
        updated_at: new Date().toISOString(),
      };

      // Strip any undefined keys
      Object.keys(dbPayload).forEach((k) => {
        if (dbPayload[k] === undefined) delete dbPayload[k];
      });

      let res;
      if (existing?.id) {
        // UPDATE existing row: strictly DO NOT pass `id` in payload
        res = await (supabase as any)
          .from('projects')
          .update(dbPayload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // INSERT new row: only attach id if it is a valid UUID
        if (isValidUuid(payload.id)) {
          dbPayload.id = payload.id;
        }
        res = await (supabase as any)
          .from('projects')
          .insert(dbPayload)
          .select()
          .single();
      }

      if (res.error) {
        console.error('[AdminService.upsertProject] DB error:', res.error.message);
        throw new Error(res.error.message);
      }
      const row = res.data as any;
      const resultData: Project = {
        ...row,
        enabled: row.enabled !== undefined ? Boolean(row.enabled) : row.status === 'published',
      };
      DevFallbackStore.upsertProject(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.upsertProject] Error:', err);
      return DevFallbackStore.upsertProject(project);
    }
  },

  async deleteProject(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteProject(id);
      return;
    }
    try {
      const supabase = await getDbClient();
      let query = supabase.from('projects').delete();
      if (isValidUuid(id)) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      const { error } = await query;
      if (error) console.error('[AdminService.deleteProject] DB error:', error.message);
      DevFallbackStore.deleteProject(id);
    } catch (err) {
      console.error('[AdminService.deleteProject] Exception:', err);
      DevFallbackStore.deleteProject(id);
    }
  },

  async reorderProjects(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderProjects(orderedIds);
      return;
    }
    try {
      const supabase = await getDbClient();
      const updates = orderedIds.map((id, index) => {
        let q = (supabase as any).from('projects').update({ display_order: index + 1 });
        if (isValidUuid(id)) {
          return q.eq('id', id);
        } else {
          return q.eq('slug', id);
        }
      });
      await Promise.all(updates);
    } catch (err) {
      console.error('[AdminService.reorderProjects] Exception:', err);
      DevFallbackStore.reorderProjects(orderedIds);
    }
  },

  // ----------------------------------------------------------------------------
  // EXPERIENCE
  // ----------------------------------------------------------------------------
  async getAllExperience(): Promise<Experience[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllExperience();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AdminService.getAllExperience] DB error:', error.message);
        return DevFallbackStore.getAllExperience();
      }
      if (Array.isArray(data) && data.length > 0) {
        return data as Experience[];
      }
      return DevFallbackStore.getAllExperience();
    } catch (err) {
      console.error('[AdminService.getAllExperience] Exception:', err);
      return DevFallbackStore.getAllExperience();
    }
  },

  async upsertExperience(exp: Partial<Experience>): Promise<Experience> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertExperience(exp);
    }
    try {
      const supabase = await getDbClient();
      const payload: any = { ...exp, updated_at: new Date().toISOString() };

      let existing: any = null;
      if (isValidUuid(payload.id)) {
        const { data } = await supabase.from('experience').select('id').eq('id', payload.id).maybeSingle();
        existing = data;
      } else if (payload.company && payload.position) {
        const { data } = await supabase
          .from('experience')
          .select('id')
          .eq('company', payload.company)
          .eq('position', payload.position)
          .maybeSingle();
        existing = data;
      }

      if (!isValidUuid(payload.id)) {
        delete payload.id;
      }

      let res;
      if (existing?.id) {
        const updatePayload = { ...payload };
        delete updatePayload.id;
        res = await (supabase as any)
          .from('experience')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        res = await (supabase as any)
          .from('experience')
          .insert(payload)
          .select()
          .single();
      }

      if (res.error) {
        console.error('[AdminService.upsertExperience] DB error:', res.error.message);
        throw new Error(res.error.message);
      }
      const resultData = res.data as Experience;
      DevFallbackStore.upsertExperience(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.upsertExperience] Error:', err);
      return DevFallbackStore.upsertExperience(exp);
    }
  },

  async getExperienceById(id: string): Promise<Experience | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getExperienceById(id);
    }
    try {
      if (!isValidUuid(id)) {
        return DevFallbackStore.getExperienceById(id);
      }
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getExperienceById] DB error:', error.message);
        return DevFallbackStore.getExperienceById(id);
      }
      return (data as Experience | null) || DevFallbackStore.getExperienceById(id);
    } catch (err) {
      console.error('[AdminService.getExperienceById] Exception:', err);
      return DevFallbackStore.getExperienceById(id);
    }
  },

  async reorderExperience(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderExperience(orderedIds);
      return;
    }
    try {
      const supabase = await getDbClient();
      const updates = orderedIds.filter(isValidUuid).map((id, index) =>
        (supabase as any).from('experience').update({ display_order: index + 1 }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error('[AdminService.reorderExperience] Exception:', err);
      DevFallbackStore.reorderExperience(orderedIds);
    }
  },

  async deleteExperience(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteExperience(id);
      return;
    }
    try {
      if (isValidUuid(id)) {
        const supabase = await getDbClient();
        const { error } = await supabase.from('experience').delete().eq('id', id);
        if (error) console.error('[AdminService.deleteExperience] DB error:', error.message);
      }
      DevFallbackStore.deleteExperience(id);
    } catch (err) {
      console.error('[AdminService.deleteExperience] Exception:', err);
      DevFallbackStore.deleteExperience(id);
    }
  },

  // ----------------------------------------------------------------------------
  // SKILLS & CATEGORIES
  // ----------------------------------------------------------------------------
  async getAllSkills(): Promise<Skill[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllSkills();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AdminService.getAllSkills] DB error:', error.message);
        return DevFallbackStore.getAllSkills();
      }
      if (Array.isArray(data) && data.length > 0) {
        return data as Skill[];
      }
      return DevFallbackStore.getAllSkills();
    } catch (err) {
      console.error('[AdminService.getAllSkills] Exception:', err);
      return DevFallbackStore.getAllSkills();
    }
  },

  async getSkillById(id: string): Promise<Skill | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getSkillById(id);
    }
    try {
      if (!isValidUuid(id)) {
        return DevFallbackStore.getSkillById(id);
      }
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getSkillById] DB error:', error.message);
        return DevFallbackStore.getSkillById(id);
      }
      return (data as Skill | null) || DevFallbackStore.getSkillById(id);
    } catch (err) {
      console.error('[AdminService.getSkillById] Exception:', err);
      return DevFallbackStore.getSkillById(id);
    }
  },

  async upsertSkill(skill: Partial<Skill>): Promise<Skill> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertSkill(skill);
    }
    try {
      const supabase = await getDbClient();
      const payload: any = { ...skill, updated_at: new Date().toISOString() };

      let existing: any = null;
      if (isValidUuid(payload.id)) {
        const { data } = await supabase.from('skills').select('id').eq('id', payload.id).maybeSingle();
        existing = data;
      } else if (payload.name) {
        const { data } = await supabase.from('skills').select('id').eq('name', payload.name).maybeSingle();
        existing = data;
      }

      if (!isValidUuid(payload.id)) {
        delete payload.id;
      }

      let res;
      if (existing?.id) {
        const updatePayload = { ...payload };
        delete updatePayload.id;
        res = await (supabase as any)
          .from('skills')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        res = await (supabase as any)
          .from('skills')
          .insert(payload)
          .select()
          .single();
      }

      if (res.error) {
        console.error('[AdminService.upsertSkill] DB error:', res.error.message);
        throw new Error(res.error.message);
      }
      const resultData = res.data as Skill;
      DevFallbackStore.upsertSkill(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.upsertSkill] Error:', err);
      return DevFallbackStore.upsertSkill(skill);
    }
  },

  async deleteSkill(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteSkill(id);
      return;
    }
    try {
      if (isValidUuid(id)) {
        const supabase = await getDbClient();
        const { error } = await supabase.from('skills').delete().eq('id', id);
        if (error) console.error('[AdminService.deleteSkill] DB error:', error.message);
      }
      DevFallbackStore.deleteSkill(id);
    } catch (err) {
      console.error('[AdminService.deleteSkill] Exception:', err);
      DevFallbackStore.deleteSkill(id);
    }
  },

  async reorderSkills(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderSkills(orderedIds);
      return;
    }
    try {
      const supabase = await getDbClient();
      const updates = orderedIds.filter(isValidUuid).map((id, index) =>
        (supabase as any).from('skills').update({ display_order: index + 1 }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error('[AdminService.reorderSkills] Exception:', err);
      DevFallbackStore.reorderSkills(orderedIds);
    }
  },

  async getSkillCategories(): Promise<SkillCategory[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getSkillCategories();
    }
    try {
      const sections = await this.getAllSections();
      const skillsSection = sections.find((s) => s.type === 'skills' || s.slug === 'skills');
      const content = skillsSection?.content as any;
      let categories: SkillCategory[] = content?.categories || [];

      if (categories.length === 0) {
        const skills = await this.getAllSkills();
        const distinct = Array.from(new Set(skills.map((s) => s.category)));
        categories = distinct.map((name, idx) => ({
          id: `cat-${idx + 1}`,
          name,
          display_order: idx + 1,
          enabled: true,
        }));
      }

      return [...categories].sort((a, b) => a.display_order - b.display_order);
    } catch {
      return DevFallbackStore.getSkillCategories();
    }
  },

  async upsertSkillCategory(cat: Partial<SkillCategory>): Promise<SkillCategory> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertSkillCategory(cat);
    }
    try {
      const sections = await this.getAllSections();
      const skillsSection = sections.find((s) => s.type === 'skills' || s.slug === 'skills');
      const content = (skillsSection?.content as any) || {};
      const categories: SkillCategory[] = content.categories ? [...content.categories] : [];

      let targetCategory: SkillCategory;
      if (cat.id) {
        const index = categories.findIndex((c) => c.id === cat.id);
        if (index >= 0) {
          const oldName = categories[index].name;
          targetCategory = { ...categories[index], ...cat } as SkillCategory;
          categories[index] = targetCategory;

          if (cat.name && cat.name !== oldName) {
            const supabase = await getDbClient();
            await (supabase as any)
              .from('skills')
              .update({ category: cat.name })
              .eq('category', oldName);
          }
        } else {
          targetCategory = {
            id: cat.id,
            name: cat.name || 'New Category',
            description: cat.description,
            icon: cat.icon || '⚡',
            display_order: cat.display_order || categories.length + 1,
            enabled: cat.enabled !== undefined ? cat.enabled : true,
          };
          categories.push(targetCategory);
        }
      } else {
        targetCategory = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cat.name || 'New Category',
          description: cat.description,
          icon: cat.icon || '⚡',
          display_order: cat.display_order || categories.length + 1,
          enabled: cat.enabled !== undefined ? cat.enabled : true,
        };
        categories.push(targetCategory);
      }

      const updatedContent = {
        ...content,
        categories,
        categoriesOrder: categories
          .sort((a, b) => a.display_order - b.display_order)
          .map((c) => c.name),
      };

      await this.upsertSection({
        id: skillsSection?.id,
        type: 'skills',
        title: skillsSection?.title || 'Skills',
        slug: 'skills',
        content: updatedContent,
      });

      return targetCategory;
    } catch {
      return DevFallbackStore.upsertSkillCategory(cat);
    }
  },

  async deleteSkillCategory(catId: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteSkillCategory(catId);
      return;
    }
    try {
      const sections = await this.getAllSections();
      const skillsSection = sections.find((s) => s.type === 'skills' || s.slug === 'skills');
      if (!skillsSection) return;

      const content = (skillsSection.content as any) || {};
      const categories = (content.categories || []).filter((c: SkillCategory) => c.id !== catId);

      const updatedContent = {
        ...content,
        categories,
        categoriesOrder: categories
          .sort((a: SkillCategory, b: SkillCategory) => a.display_order - b.display_order)
          .map((c: SkillCategory) => c.name),
      };

      await this.upsertSection({
        id: skillsSection.id,
        type: 'skills',
        title: skillsSection.title,
        slug: 'skills',
        content: updatedContent,
      });
    } catch {
      DevFallbackStore.deleteSkillCategory(catId);
    }
  },

  async reorderSkillCategories(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderSkillCategories(orderedIds);
      return;
    }
    try {
      const sections = await this.getAllSections();
      const skillsSection = sections.find((s) => s.type === 'skills' || s.slug === 'skills');
      if (!skillsSection) return;

      const content = (skillsSection.content as any) || {};
      const categories: SkillCategory[] = content.categories ? [...content.categories] : [];

      orderedIds.forEach((id, index) => {
        const cat = categories.find((c) => c.id === id || c.name === id);
        if (cat) {
          cat.display_order = index + 1;
        }
      });

      const updatedContent = {
        ...content,
        categories: [...categories].sort((a, b) => a.display_order - b.display_order),
        categoriesOrder: [...categories]
          .sort((a, b) => a.display_order - b.display_order)
          .map((c) => c.name),
      };

      await this.upsertSection({
        id: skillsSection.id,
        type: 'skills',
        title: skillsSection.title,
        slug: 'skills',
        content: updatedContent,
      });
    } catch {
      DevFallbackStore.reorderSkillCategories(orderedIds);
    }
  },

  // ----------------------------------------------------------------------------
  // CERTIFICATIONS
  // ----------------------------------------------------------------------------
  async getAllCertifications(): Promise<Certification[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllCertifications();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AdminService.getAllCertifications] DB error:', error.message);
        return DevFallbackStore.getAllCertifications();
      }
      if (Array.isArray(data) && data.length > 0) {
        return data as Certification[];
      }
      return DevFallbackStore.getAllCertifications();
    } catch (err) {
      console.error('[AdminService.getAllCertifications] Exception:', err);
      return DevFallbackStore.getAllCertifications();
    }
  },

  async getCertificationById(id: string): Promise<Certification | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getCertificationById(id);
    }
    try {
      if (!isValidUuid(id)) {
        return DevFallbackStore.getCertificationById(id);
      }
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getCertificationById] DB error:', error.message);
        return DevFallbackStore.getCertificationById(id);
      }
      return (data as unknown as Certification) || DevFallbackStore.getCertificationById(id);
    } catch (err) {
      console.error('[AdminService.getCertificationById] Exception:', err);
      return DevFallbackStore.getCertificationById(id);
    }
  },

  async upsertCertification(cert: Partial<Certification>): Promise<Certification> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertCertification(cert);
    }
    try {
      const supabase = await getDbClient();
      const payload: any = { ...cert, updated_at: new Date().toISOString() };

      let existing: any = null;
      if (isValidUuid(payload.id)) {
        const { data } = await supabase.from('certifications').select('id').eq('id', payload.id).maybeSingle();
        existing = data;
      } else if (payload.title) {
        const { data } = await supabase.from('certifications').select('id').eq('title', payload.title).maybeSingle();
        existing = data;
      }

      if (!isValidUuid(payload.id)) {
        delete payload.id;
      }

      let res;
      if (existing?.id) {
        const updatePayload = { ...payload };
        delete updatePayload.id;
        res = await (supabase as any)
          .from('certifications')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        res = await (supabase as any)
          .from('certifications')
          .insert(payload)
          .select()
          .single();
      }

      if (res.error) {
        console.error('[AdminService.upsertCertification] DB error:', res.error.message);
        throw new Error(res.error.message);
      }
      const resultData = res.data as Certification;
      DevFallbackStore.upsertCertification(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.upsertCertification] Error:', err);
      return DevFallbackStore.upsertCertification(cert);
    }
  },

  async deleteCertification(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteCertification(id);
      return;
    }
    try {
      if (isValidUuid(id)) {
        const supabase = await getDbClient();
        const { error } = await supabase.from('certifications').delete().eq('id', id);
        if (error) console.error('[AdminService.deleteCertification] DB error:', error.message);
      }
      DevFallbackStore.deleteCertification(id);
    } catch (err) {
      console.error('[AdminService.deleteCertification] Exception:', err);
      DevFallbackStore.deleteCertification(id);
    }
  },

  async reorderCertifications(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderCertifications(orderedIds);
      return;
    }
    try {
      const supabase = await getDbClient();
      const updates = orderedIds.filter(isValidUuid).map((id, index) =>
        (supabase as any)
          .from('certifications')
          .update({ display_order: index + 1 })
          .eq('id', id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error('[AdminService.reorderCertifications] Exception:', err);
      DevFallbackStore.reorderCertifications(orderedIds);
    }
  },

  // ----------------------------------------------------------------------------
  // SITE SETTINGS & CONTACT
  // ----------------------------------------------------------------------------
  async getSiteSettings(): Promise<SiteSettings | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getSiteSettings();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getSiteSettings] Error:', error.message);
        return DevFallbackStore.getSiteSettings();
      }
      if (data) {
        return data as unknown as SiteSettings;
      }
      return DevFallbackStore.getSiteSettings();
    } catch (err) {
      console.error('[AdminService.getSiteSettings] Exception:', err);
      return DevFallbackStore.getSiteSettings();
    }
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.updateSiteSettings(settings);
    }
    try {
      const supabase = await getDbClient();

      // Find the existing singleton row
      const { data: existingRow, error: findError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      const existing = existingRow as any;

      if (findError) {
        console.warn('[AdminService.updateSiteSettings] Lookup warning:', findError.message);
      }

      const payload: any = {
        ...settings,
        updated_at: new Date().toISOString(),
      };
      // Never attempt to change primary key or pass null/undefined id into upsert/insert
      delete payload.id;

      let resultData: SiteSettings;

      if (existing?.id) {
        const { data, error } = await (supabase as any)
          .from('site_settings')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('[AdminService.updateSiteSettings] Update error:', error.message);
          throw new Error(error.message);
        }
        resultData = data as SiteSettings;
      } else {
        const { data, error } = await (supabase as any)
          .from('site_settings')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('[AdminService.updateSiteSettings] Insert error:', error.message);
          throw new Error(error.message);
        }
        resultData = data as SiteSettings;
      }

      // Also update in-memory fallback store
      DevFallbackStore.updateSiteSettings(resultData);
      return resultData;
    } catch (err) {
      console.error('[AdminService.updateSiteSettings] Fatal error:', err);
      return DevFallbackStore.updateSiteSettings(settings);
    }
  },

  async getContactSection(): Promise<Section | null> {
    const sections = await this.getAllSections();
    return (
      sections.find((s) => s.type === 'contact' || s.slug === 'contact') || null
    );
  },

  // ----------------------------------------------------------------------------
  // SOCIAL LINKS (CENTRALIZED AUTHORITATIVE SOURCE OF TRUTH)
  // ----------------------------------------------------------------------------
  async getSocialLinks(): Promise<SocialLinkItem[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getSocialLinks();
    }
    try {
      const settings = await this.getSiteSettings();
      return parseSocialLinks(settings?.social_links);
    } catch {
      return DevFallbackStore.getSocialLinks();
    }
  },

  async upsertSocialLink(link: Partial<SocialLinkItem>): Promise<SocialLinkItem> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.upsertSocialLink(link);
    }
    try {
      const settings = await this.getSiteSettings();
      const list = parseSocialLinks(settings?.social_links);
      const now = new Date().toISOString();

      let targetLink: SocialLinkItem;

      if (link.id) {
        const idx = list.findIndex((item) => item.id === link.id);
        if (idx >= 0) {
          targetLink = {
            ...list[idx],
            ...link,
            updated_at: now,
          } as SocialLinkItem;
          list[idx] = targetLink;
        } else {
          const maxOrder = list.reduce(
            (max, item) => Math.max(max, item.display_order || 0),
            0
          );
          targetLink = {
            id: link.id,
            platform: link.platform || 'Custom Link',
            label: link.label || link.platform || 'Custom Link',
            url: link.url || '',
            icon: link.icon || '',
            display_order:
              typeof link.display_order === 'number'
                ? link.display_order
                : maxOrder + 1,
            enabled: link.enabled !== undefined ? link.enabled : true,
            status: link.status || 'published',
            created_at: now,
            updated_at: now,
          };
          list.push(targetLink);
        }
      } else {
        const maxOrder = list.reduce(
          (max, item) => Math.max(max, item.display_order || 0),
          0
        );
        const newId = `soc-${(link.platform || 'link')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;
        targetLink = {
          id: newId,
          platform: link.platform || 'Custom Link',
          label: link.label || link.platform || 'Custom Link',
          url: link.url || '',
          icon: link.icon || '',
          display_order:
            typeof link.display_order === 'number'
              ? link.display_order
              : maxOrder + 1,
          enabled: link.enabled !== undefined ? link.enabled : true,
          status: link.status || 'published',
          created_at: now,
          updated_at: now,
        };
        list.push(targetLink);
      }

      await this.updateSiteSettings({
        id: settings?.id,
        social_links: list,
      });

      return targetLink;
    } catch {
      return DevFallbackStore.upsertSocialLink(link);
    }
  },

  async deleteSocialLink(id: string): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.deleteSocialLink(id);
      return;
    }
    try {
      const settings = await this.getSiteSettings();
      const list = parseSocialLinks(settings?.social_links).filter(
        (item) => item.id !== id
      );
      await this.updateSiteSettings({
        id: settings?.id,
        social_links: list,
      });
    } catch {
      DevFallbackStore.deleteSocialLink(id);
    }
  },

  async reorderSocialLinks(orderedIds: string[]): Promise<void> {
    if (!DevFallbackStore.isConfigured()) {
      DevFallbackStore.reorderSocialLinks(orderedIds);
      return;
    }
    try {
      const settings = await this.getSiteSettings();
      const list = parseSocialLinks(settings?.social_links);
      orderedIds.forEach((id, index) => {
        const item = list.find((s) => s.id === id);
        if (item) {
          item.display_order = index + 1;
        }
      });
      list.sort((a, b) => a.display_order - b.display_order);
      await this.updateSiteSettings({
        id: settings?.id,
        social_links: list,
      });
    } catch {
      DevFallbackStore.reorderSocialLinks(orderedIds);
    }
  },

  async toggleSocialLink(id: string, enabled?: boolean): Promise<SocialLinkItem | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.toggleSocialLink(id, enabled);
    }
    try {
      const settings = await this.getSiteSettings();
      const list = parseSocialLinks(settings?.social_links);
      const item = list.find((s) => s.id === id);
      if (!item) return null;
      item.enabled = enabled !== undefined ? enabled : !item.enabled;
      item.updated_at = new Date().toISOString();

      await this.updateSiteSettings({
        id: settings?.id,
        social_links: list,
      });

      return item;
    } catch {
      return DevFallbackStore.toggleSocialLink(id, enabled);
    }
  },


  // ----------------------------------------------------------------------------
  // DRAFT & PUBLISHING WORKFLOW (PHASE 13)
  // ----------------------------------------------------------------------------
  async getAllDrafts(): Promise<CmsDraft[]> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getAllDrafts();
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[AdminService.getAllDrafts] DB error:', error.message);
        return DevFallbackStore.getAllDrafts();
      }
      return (data as CmsDraft[]) || DevFallbackStore.getAllDrafts();
    } catch (err) {
      console.error('[AdminService.getAllDrafts] Exception:', err);
      return DevFallbackStore.getAllDrafts();
    }
  },

  async getDraftById(id: string): Promise<CmsDraft | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getDraftById(id);
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getDraftById] DB error:', error.message);
        return DevFallbackStore.getDraftById(id);
      }
      return (data as unknown as CmsDraft) || DevFallbackStore.getDraftById(id);
    } catch (err) {
      console.error('[AdminService.getDraftById] Exception:', err);
      return DevFallbackStore.getDraftById(id);
    }
  },

  async getDraftByEntity(entityType: DraftEntityType, entityId: string): Promise<CmsDraft | null> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.getDraftByEntity(entityType, entityId);
    }
    try {
      const supabase = await getDbClient();
      const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();

      if (error) {
        console.error('[AdminService.getDraftByEntity] DB error:', error.message);
        return DevFallbackStore.getDraftByEntity(entityType, entityId);
      }
      return (data as unknown as CmsDraft) || DevFallbackStore.getDraftByEntity(entityType, entityId);
    } catch (err) {
      console.error('[AdminService.getDraftByEntity] Exception:', err);
      return DevFallbackStore.getDraftByEntity(entityType, entityId);
    }
  },

  async saveDraft(
    draft: Omit<CmsDraft, 'created_at' | 'updated_at' | 'status'> & { id?: string }
  ): Promise<CmsDraft> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.saveDraft(draft);
    }
    try {
      const supabase = await getDbClient();
      const id = draft.id || `draft-${draft.entity_type}-${draft.entity_id}`;
      const now = new Date().toISOString();

      const payload = {
        id,
        entity_type: draft.entity_type,
        entity_id: draft.entity_id,
        title: draft.title || `Draft: ${draft.entity_type}`,
        summary: draft.summary || `Unpublished updates to ${draft.entity_type}`,
        data: draft.data,
        status: 'draft',
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('cms_drafts')
        .upsert(payload as any)
        .select()
        .single();

      if (error) {
        console.error('[AdminService.saveDraft] DB error:', error.message);
        throw new Error(error.message);
      }
      const saved = data as CmsDraft;
      DevFallbackStore.saveDraft(saved);
      return saved;
    } catch (err) {
      console.error('[AdminService.saveDraft] Error:', err);
      return DevFallbackStore.saveDraft(draft);
    }
  },

  async discardDraft(id: string): Promise<boolean> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.discardDraft(id);
    }
    try {
      const supabase = await getDbClient();
      const { error } = await supabase.from('cms_drafts').delete().eq('id', id);
      if (error) console.error('[AdminService.discardDraft] DB error:', error.message);
      DevFallbackStore.discardDraft(id);
      return true;
    } catch (err) {
      console.error('[AdminService.discardDraft] Exception:', err);
      return DevFallbackStore.discardDraft(id);
    }
  },

  async discardAllDrafts(): Promise<boolean> {
    if (!DevFallbackStore.isConfigured()) {
      return DevFallbackStore.discardAllDrafts();
    }
    try {
      const supabase = await getDbClient();
      const { error } = await supabase.from('cms_drafts').delete().neq('id', 'non-existent');
      if (error) console.error('[AdminService.discardAllDrafts] DB error:', error.message);
      DevFallbackStore.discardAllDrafts();
      return true;
    } catch (err) {
      console.error('[AdminService.discardAllDrafts] Exception:', err);
      return DevFallbackStore.discardAllDrafts();
    }
  },

  async publishDraft(id: string): Promise<{ success: boolean; message: string }> {
    const draft = await this.getDraftById(id);
    if (!draft) {
      return { success: false, message: 'Draft not found.' };
    }

    const { entity_type, entity_id, data } = draft;

    try {
      switch (entity_type) {
        case 'site_settings':
          await this.updateSiteSettings(data);
          break;

        case 'theme':
          if (data && data.active_theme) {
            await this.updateSiteSettings({ active_theme: data.active_theme });
          }
          break;

        case 'sections_order':
          if (Array.isArray(data.orderedIds)) {
            await this.reorderSections(data.orderedIds);
          }
          if (data.enabledMap && typeof data.enabledMap === 'object') {
            for (const [secId, enabled] of Object.entries(data.enabledMap)) {
              await this.updateSection(secId, { enabled: Boolean(enabled) });
            }
          }
          break;

        case 'section':
          await this.updateSection(entity_id, {
            ...data,
            status: 'published',
          });
          break;

        case 'project':
          await this.upsertProject({
            ...data,
            id: entity_id,
            status: 'published',
            enabled: true,
          });
          break;

        case 'experience':
          await this.upsertExperience({
            ...data,
            id: entity_id,
            status: 'published',
            enabled: true,
          });
          break;

        case 'certification':
          await this.upsertCertification({
            ...data,
            id: entity_id,
            status: 'published',
            enabled: true,
          });
          break;

        case 'skill':
          await this.upsertSkill({
            ...data,
            id: entity_id,
            enabled: true,
          });
          break;

        case 'social_link':
          await this.upsertSocialLink({
            ...data,
            id: entity_id,
            status: 'published',
            enabled: true,
          });
          break;

        default:
          return { success: false, message: `Unknown draft entity type: ${entity_type}` };
      }

      await this.discardDraft(draft.id);
      return { success: true, message: `Published "${draft.title}".` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      return { success: false, message: msg };
    }
  },

  async publishAllDrafts(): Promise<{ publishedCount: number; message: string }> {
    const drafts = await this.getAllDrafts();
    let count = 0;

    for (const draft of drafts) {
      const res = await this.publishDraft(draft.id);
      if (res.success) {
        count++;
      }
    }

    return {
      publishedCount: count,
      message: `Successfully published ${count} draft update${count === 1 ? '' : 's'}.`,
    };
  },

  // ----------------------------------------------------------------------------
  // MEDIA MANAGEMENT (Phase 14: Centralized Media Management & Usage Tracking)
  // ----------------------------------------------------------------------------
  async getAllMedia(params?: {
    search?: string;
    type?: string;
    sort?: string;
  }): Promise<MediaItemWithUsage[]> {
    let items: MediaItemWithUsage[] = [];

    if (!DevFallbackStore.isConfigured()) {
      items = DevFallbackStore.getAllMediaWithUsage();
    } else {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          items = await Promise.all(
            data.map(async (m: MediaItem) => {
              const references = await this.getMediaUsage(m.id);
              return {
                ...m,
                references,
                usageCount: references.length,
                inUse: references.length > 0,
              };
            })
          );
        } else {
          items = DevFallbackStore.getAllMediaWithUsage();
        }
      } catch {
        items = DevFallbackStore.getAllMediaWithUsage();
      }
    }

    // Apply Search Filter
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (m) =>
          m.file_name.toLowerCase().includes(q) ||
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.alt_text && m.alt_text.toLowerCase().includes(q)) ||
          m.mime_type.toLowerCase().includes(q)
      );
    }

    // Apply Type Filter
    if (params?.type && params.type !== 'all') {
      items = items.filter((m) => m.media_type === params.type);
    }

    // Apply Sorting
    if (params?.sort) {
      if (params.sort === 'oldest' || params.sort === 'date-asc') {
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (params.sort === 'name' || params.sort === 'name-asc') {
        items.sort((a, b) => (a.title || a.file_name).localeCompare(b.title || b.file_name));
      } else if (params.sort === 'name-desc') {
        items.sort((a, b) => (b.title || b.file_name).localeCompare(a.title || a.file_name));
      } else if (params.sort === 'size' || params.sort === 'size-desc') {
        items.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
      } else if (params.sort === 'size-asc') {
        items.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));
      } else {
        // default newest / date-desc
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }

    return items;
  },

  async getMediaById(id: string): Promise<MediaItemWithUsage | null> {
    const all = await this.getAllMedia();
    return all.find((m) => m.id === id || m.file_name === id || m.storage_path === id) || null;
  },

  async getMediaUsage(idOrUrl: string): Promise<MediaUsageReference[]> {
    // Usage references are resolved by evaluating all portfolio entities
    return DevFallbackStore.getMediaUsage(idOrUrl);
  },

  async registerMedia(
    media: Omit<MediaItem, 'id' | 'created_at'> & { id?: string }
  ): Promise<MediaItem> {
    // 1. Always update local store
    const item = DevFallbackStore.registerMedia(media);

    // 2. Also register in PostgreSQL if configured
    if (DevFallbackStore.isConfigured()) {
      try {
        const supabase = await getDbClient();
        await (supabase as any).from('media').upsert({
          id: item.id,
          file_name: item.file_name,
          storage_path: item.storage_path,
          public_url: item.public_url,
          media_type: item.media_type,
          mime_type: item.mime_type,
          file_size: item.file_size,
          alt_text: item.alt_text || '',
          title: item.title || item.file_name,
          description: item.description || '',
          width: item.width || null,
          height: item.height || null,
        });
      } catch (err) {
        console.warn('[AdminService.registerMedia] Postgres upsert notice:', err);
      }
    }

    return item;
  },

  async updateMediaMetadata(
    id: string,
    metadata: { title?: string; alt_text?: string; description?: string }
  ): Promise<MediaItem | null> {
    const updated = DevFallbackStore.updateMediaMetadata(id, metadata);

    if (DevFallbackStore.isConfigured() && updated) {
      try {
        const supabase = await getDbClient();
        await (supabase as any)
          .from('media')
          .update({
            title: updated.title,
            alt_text: updated.alt_text,
            description: updated.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updated.id);
      } catch (err) {
        console.warn('[AdminService.updateMediaMetadata] Postgres update notice:', err);
      }
    }

    return updated;
  },

  async deleteMedia(
    id: string
  ): Promise<{ success: boolean; message: string; error?: string; deletedPath?: string }> {
    // 1. Determine usage references
    const usage = await this.getMediaUsage(id);
    if (usage.length > 0) {
      const refNames = usage.map((r) => r.entityTitle).slice(0, 3).join(', ');
      return {
        success: false,
        message: `Cannot delete media: it is currently referenced by ${usage.length} active content item(s) (${refNames}). Remove these references before deleting.`,
        error: 'Media in use',
      };
    }

    // 2. Retrieve existing media item before deletion
    const item = await this.getMediaById(id);
    if (!item) {
      return { success: false, message: 'Media not found.', error: 'Media not found' };
    }

    // 3. Delete from Supabase Storage bucket if configured
    if (DevFallbackStore.isConfigured() && item.storage_path) {
      try {
        const supabase = await getDbClient();
        const bucket = item.media_type === 'document' ? 'portfolio-documents' : 'portfolio-images';
        await supabase.storage.from(bucket).remove([item.storage_path]);
        await supabase.from('media').delete().eq('id', item.id);
      } catch (err) {
        console.warn('[AdminService.deleteMedia] Storage deletion notice:', err);
      }
    }

    // 4. Delete from local store
    DevFallbackStore.deleteMedia(item.id);

    return {
      success: true,
      message: `Media "${item.title || item.file_name}" deleted successfully.`,
      deletedPath: item.public_url,
    };
  },

  async getMediaStats(): Promise<{
    totalMedia: number;
    totalImages: number;
    totalDocuments: number;
    inUseCount: number;
    unusedCount: number;
    totalSizeBytes: number;
    totalCount: number;
    imagesCount: number;
    documentsCount: number;
  }> {
    return DevFallbackStore.getMediaStats();
  },

  async uploadAndRegisterMedia(
    file: File,
    options?: {
      title?: string;
      alt_text?: string;
      description?: string;
      bucket?: string;
    }
  ): Promise<{
    success: boolean;
    status: number;
    error?: string;
    media?: MediaItem;
    url?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }> {
    const ALLOWED_IMAGE_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const ALLOWED_DOC_TYPES = ['application/pdf'];
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

    const isDocument = options?.bucket === 'portfolio-documents' || file.type === 'application/pdf';
    const allowedTypes = isDocument ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isDocument ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;

    // 1. Validate MIME type
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        status: 400,
        error: `Unsupported file type (${file.type}). Allowed formats: ${allowedTypes.join(', ')}`,
      };
    }

    // 2. Validate Size
    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return {
        success: false,
        status: 400,
        error: `File size exceeds limit of ${maxMb}MB. Please select a smaller file.`,
      };
    }

    const rawBytes = await file.arrayBuffer();
    const buffer = Buffer.from(rawBytes);
    const timestamp = Date.now();
    const safeBaseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${timestamp}-${safeBaseName}`;
    const bucket = isDocument ? 'portfolio-documents' : 'portfolio-images';

    let publicUrl = '';
    let usedFallback = false;

    // 3. Supabase upload if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = await getDbClient();
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;
        } else {
          console.warn('[AdminService.uploadAndRegisterMedia] Cloud upload warning:', uploadError.message);
          usedFallback = true;
        }
      } catch (err) {
        console.warn('[AdminService.uploadAndRegisterMedia] Cloud upload exception:', err);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 4. Local storage fallback
    if (usedFallback || !publicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, storagePath);
      fs.writeFileSync(localFilePath, buffer);
      publicUrl = `/uploads/${storagePath}`;
    }

    // 5. Register in DB / store
    const media = await this.registerMedia({
      title: options?.title || file.name,
      file_name: storagePath,
      storage_path: storagePath,
      public_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      media_type: isDocument ? 'document' : 'image',
      alt_text: options?.alt_text || (isDocument ? 'Document' : 'Uploaded Image'),
      description: options?.description || '',
    });

    return {
      success: true,
      status: 201,
      media,
      url: publicUrl,
      fileName: storagePath,
      fileSize: file.size,
      mimeType: file.type,
    };
  },
};
