// ==============================================================================
// MACHINE LEARNING ENGINEER PORTFOLIO — TYPESCRIPT DATABASE & CMS SCHEMAS
// Phase 0: Type safety definitions for PostgreSQL tables and dynamic sections
// ==============================================================================

export type PublishStatus = 'draft' | 'published' | 'archived';

export type SectionType =
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'certifications'
  | 'contact'
  | 'gallery'
  | 'image'
  | 'video'
  | 'text'
  | 'quote'
  | 'timeline'
  | 'custom';

export type MediaType = 'image' | 'video' | 'document' | 'other';

// ------------------------------------------------------------------------------
// 1. DYNAMIC SECTION JSONB CONTENT SCHEMAS
// ------------------------------------------------------------------------------

export interface HeroContent {
  greeting?: string;
  badge?: string;
  summary?: string;
  primaryCta?: {
    label: string;
    anchor: string;
  };
  secondaryCta?: {
    label: string;
    anchor: string;
  };
  scrollIndicatorText?: string;
}

export interface AboutPillar {
  title: string;
  description: string;
  icon?: string;
}

export interface AboutContent {
  badge?: string;
  heading?: string;
  description?: string;
  pillars?: AboutPillar[];
  avatarUrl?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  enabled: boolean;
}

export interface SkillsContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  categoriesOrder?: string[];
  categories?: SkillCategory[];
}

export interface ExperienceContent {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface ProjectsContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  featuredOnly?: boolean;
}

export interface CertificationsContent {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label?: string;
  url: string;
  icon?: string;
  display_order: number;
  enabled: boolean;
  status?: PublishStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ContactContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  availabilityText?: string;
  submitButtonText?: string;
  successMessage?: string;
}

export type SectionContent =
  | HeroContent
  | AboutContent
  | SkillsContent
  | ExperienceContent
  | ProjectsContent
  | CertificationsContent
  | ContactContent
  | Record<string, unknown>;

// ------------------------------------------------------------------------------
// 2. DATABASE ENTITY MODELS
// ------------------------------------------------------------------------------

export interface SiteSettings {
  id: string;
  name: string;
  title?: string;
  professional_title: string;
  subtitle: string;
  bio: string;
  email: string;
  phone?: string | null;
  location: string;
  social_links:
  | SocialLinkItem[]
  | {
    linkedin?: string;
    github?: string;
    x?: string;
    email?: string;
    [key: string]: any;
  };
  profile_image?: string | null;
  profile_image_url?: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_media?: string | null;
  hero_media_url?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  favicon?: string | null;
  favicon_url?: string | null;
  resume?: string | null;
  resume_url?: string | null;

  // Global General Settings (Phase 15)
  site_name?: string;
  site_description?: string;
  default_language?: string;
  timezone?: string;

  // Global SEO Settings (Phase 15)
  seo_title: string;
  seo_description: string;
  og_image?: string | null;
  og_image_url?: string | null;
  canonical_url?: string;
  allow_indexing?: boolean;

  // Global Appearance Settings (Phase 15 & 18)
  theme_preference?: 'dark' | 'system';
  accent_color?: 'amber' | 'emerald' | 'cyan' | 'indigo';
  active_theme?: string;

  // Global System Settings (Phase 15)
  default_items_per_page?: number;
  enable_contact_form?: boolean;
  analytics_enabled?: boolean;

  updated_at: string;
}

export interface Section<T = SectionContent> {
  id: string;
  type: SectionType;
  title: string;
  slug: string;
  content: T;
  display_order: number;
  enabled: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  gallery_urls: string[];
  technologies: string[];
  github_url?: string | null;
  live_url?: string | null;
  featured: boolean;
  display_order: number;
  enabled?: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  proficiency?: number | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  current_position?: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  company_logo?: string | null;
  company_logo_url?: string | null;
  display_order: number;
  enabled: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  description: string;
  display_order: number;
  enabled?: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  media_type: MediaType;
  mime_type: string;
  file_size: number;
  alt_text?: string;
  title?: string;
  description?: string;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface MediaUsageReference {
  entityType: 'profile' | 'hero' | 'about' | 'project' | 'experience' | 'certification' | 'section' | 'draft';
  entityId: string;
  entityTitle: string;
  field: string;
  isDraft?: boolean;
}

export interface MediaItemWithUsage extends MediaItem {
  references: MediaUsageReference[];
  usageCount: number;
  inUse: boolean;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export type DraftEntityType =
  | 'site_settings'
  | 'theme'
  | 'section'
  | 'sections_order'
  | 'project'
  | 'experience'
  | 'certification'
  | 'skill'
  | 'social_link';

export interface CmsDraft {
  id: string;
  entity_type: DraftEntityType;
  entity_id: string;
  title: string;
  summary?: string;
  data: Record<string, any>;
  status: 'draft';
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// 3. SUPABASE DATABASE SCHEMA MAPPING
// ------------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      sections: {
        Row: Section;
        Insert: Omit<Section, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Section>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Project>;
        Relationships: [];
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Skill>;
        Relationships: [];
      };
      experience: {
        Row: Experience;
        Insert: Omit<Experience, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Experience>;
        Relationships: [];
      };
      certifications: {
        Row: Certification;
        Insert: Omit<Certification, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Certification>;
        Relationships: [];
      };
      media: {
        Row: MediaItem;
        Insert: Omit<MediaItem, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<MediaItem>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AdminUser>;
        Relationships: [];
      };
      cms_drafts: {
        Row: CmsDraft;
        Insert: Omit<CmsDraft, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CmsDraft>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      publish_status: PublishStatus;
      section_type: SectionType;
      media_type: MediaType;
    };
  };
}

