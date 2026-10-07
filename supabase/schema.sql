-- ==============================================================================
-- MACHINE LEARNING ENGINEER PORTFOLIO — SUPABASE DATABASE SCHEMA
-- Phase 1: Supabase Backend, Authentication, Authorization & Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE publish_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE section_type AS ENUM (
        'hero',
        'about',
        'skills',
        'experience',
        'projects',
        'certifications',
        'contact',
        'gallery',
        'image',
        'video',
        'text',
        'quote',
        'timeline',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video', 'document', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. ADMIN USERS TABLE & AUTHORIZATION FUNCTION
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Secure Admin check function (Security Definer to query admin_users safely)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
            ) OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SITE SETTINGS TABLE (Singleton)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Mohamed Khaled',
    title TEXT NOT NULL DEFAULT 'Machine Learning Engineer',
    professional_title TEXT NOT NULL DEFAULT 'Machine Learning Engineer',
    subtitle TEXT NOT NULL DEFAULT 'Turning Data Into Intelligent Solutions',
    bio TEXT NOT NULL DEFAULT 'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.',
    email TEXT NOT NULL DEFAULT 'mohamed@example.com',
    phone TEXT,
    location TEXT DEFAULT 'Cairo, Egypt',
    social_links JSONB NOT NULL DEFAULT '{"linkedin": "https://linkedin.com", "github": "https://github.com", "x": "https://x.com", "email": "mailto:mohamed@example.com"}'::jsonb,
    profile_image TEXT,
    profile_image_url TEXT,
    hero_title TEXT NOT NULL DEFAULT 'Mohamed Khaled',
    hero_subtitle TEXT NOT NULL DEFAULT 'Machine Learning Engineer',
    hero_media TEXT,
    hero_media_url TEXT,
    logo TEXT,
    logo_url TEXT,
    favicon TEXT,
    favicon_url TEXT,
    resume TEXT,
    resume_url TEXT,
    seo_title TEXT NOT NULL DEFAULT 'Mohamed Khaled | Machine Learning Engineer Portfolio',
    seo_description TEXT NOT NULL DEFAULT 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
    site_name TEXT DEFAULT 'Mohamed Khaled Portfolio',
    site_description TEXT DEFAULT 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
    default_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    og_image TEXT,
    og_image_url TEXT,
    canonical_url TEXT DEFAULT 'https://mohamedkhaled.dev',
    allow_indexing BOOLEAN DEFAULT true,
    theme_preference TEXT DEFAULT 'dark',
    accent_color TEXT DEFAULT 'amber',
    active_theme TEXT DEFAULT 'default',
    default_items_per_page INT DEFAULT 10,
    enable_contact_form BOOLEAN DEFAULT true,
    analytics_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure only one row can exist in site_settings
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_singleton_idx ON public.site_settings ((true));

-- 5. DYNAMIC SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type section_type NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    status publish_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sections_order ON public.sections (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_sections_status_enabled ON public.sections (status, enabled);

-- 6. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL DEFAULT '',
    thumbnail TEXT,
    thumbnail_url TEXT,
    gallery TEXT[] NOT NULL DEFAULT '{}',
    gallery_urls TEXT[] NOT NULL DEFAULT '{}',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    status publish_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured);

-- 7. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    proficiency INT CHECK (proficiency >= 0 AND proficiency <= 100),
    display_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills (category);
CREATE INDEX IF NOT EXISTS idx_skills_order ON public.skills (display_order ASC);

-- 8. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Full-time',
    location TEXT DEFAULT 'Remote',
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    current_position BOOLEAN NOT NULL DEFAULT false,
    description TEXT NOT NULL DEFAULT '',
    responsibilities TEXT[] NOT NULL DEFAULT '{}',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    achievements TEXT[] NOT NULL DEFAULT '{}',
    company_logo TEXT,
    company_logo_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    status publish_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_experience_order ON public.experience (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_experience_status ON public.experience (status, enabled);

-- 9. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    credential_id TEXT,
    credential_url TEXT,
    image TEXT,
    image_url TEXT,
    description TEXT NOT NULL DEFAULT '',
    display_order INT NOT NULL DEFAULT 0,
    status publish_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_certifications_order ON public.certifications (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON public.certifications (status);

-- 10. MEDIA METADATA TABLE
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    public_url TEXT NOT NULL,
    media_type media_type NOT NULL DEFAULT 'image',
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    alt_text TEXT DEFAULT '',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    width INT,
    height INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync trigger for experience is_current and current_position
CREATE OR REPLACE FUNCTION public.sync_experience_current_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.is_current IS TRUE AND NEW.current_position IS NOT TRUE THEN
            NEW.current_position := true;
        ELSIF NEW.current_position IS TRUE AND NEW.is_current IS NOT TRUE THEN
            NEW.is_current := true;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_experience_sync_current ON public.experience;
CREATE TRIGGER tr_experience_sync_current
    BEFORE INSERT OR UPDATE ON public.experience
    FOR EACH ROW EXECUTE FUNCTION public.sync_experience_current_status();

DROP TRIGGER IF EXISTS tr_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER tr_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sections_updated_at ON public.sections;
CREATE TRIGGER tr_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_skills_updated_at ON public.skills;
CREATE TRIGGER tr_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_experience_updated_at ON public.experience;
CREATE TRIGGER tr_experience_updated_at
    BEFORE UPDATE ON public.experience
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_certifications_updated_at ON public.certifications;
CREATE TRIGGER tr_certifications_updated_at
    BEFORE UPDATE ON public.certifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ADMIN_USERS
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- SITE_SETTINGS
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- SECTIONS
DROP POLICY IF EXISTS "Public can view published sections" ON public.sections;
CREATE POLICY "Public can view published sections" ON public.sections
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND enabled = true);

DROP POLICY IF EXISTS "Admins can manage all sections" ON public.sections;
CREATE POLICY "Admins can manage all sections" ON public.sections
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- PROJECTS
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects" ON public.projects
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
CREATE POLICY "Admins can manage all projects" ON public.projects
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- SKILLS
DROP POLICY IF EXISTS "Public can view enabled skills" ON public.skills;
CREATE POLICY "Public can view enabled skills" ON public.skills
    FOR SELECT TO anon, authenticated
    USING (enabled = true);

DROP POLICY IF EXISTS "Admins can manage all skills" ON public.skills;
CREATE POLICY "Admins can manage all skills" ON public.skills
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- EXPERIENCE
DROP POLICY IF EXISTS "Public can view published experience" ON public.experience;
CREATE POLICY "Public can view published experience" ON public.experience
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND enabled = true);

DROP POLICY IF EXISTS "Admins can manage all experience" ON public.experience;
CREATE POLICY "Admins can manage all experience" ON public.experience
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- CERTIFICATIONS
DROP POLICY IF EXISTS "Public can view published certifications" ON public.certifications;
CREATE POLICY "Public can view published certifications" ON public.certifications
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all certifications" ON public.certifications;
CREATE POLICY "Admins can manage all certifications" ON public.certifications
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- MEDIA METADATA
DROP POLICY IF EXISTS "Public can view media metadata" ON public.media;
CREATE POLICY "Public can view media metadata" ON public.media
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage media metadata" ON public.media;
CREATE POLICY "Admins can manage media metadata" ON public.media
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- STORAGE BUCKETS & RLS
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('portfolio-images', 'portfolio-images', true),
    ('portfolio-videos', 'portfolio-videos', true),
    ('portfolio-documents', 'portfolio-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('portfolio-images', 'portfolio-videos', 'portfolio-documents'));

DROP POLICY IF EXISTS "Admin storage insert" ON storage.objects;
CREATE POLICY "Admin storage insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN ('portfolio-images', 'portfolio-videos', 'portfolio-documents')
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin storage update" ON storage.objects;
CREATE POLICY "Admin storage update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id IN ('portfolio-images', 'portfolio-videos', 'portfolio-documents')
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin storage delete" ON storage.objects;
CREATE POLICY "Admin storage delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id IN ('portfolio-images', 'portfolio-videos', 'portfolio-documents')
        AND public.is_admin()
    );

-- 12. CMS DRAFTS TABLE (Phase 13: Draft / Preview / Publish Workflow)
CREATE TABLE IF NOT EXISTS public.cms_drafts (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cms_drafts_entity ON public.cms_drafts (entity_type, entity_id);

ALTER TABLE public.cms_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage cms_drafts" ON public.cms_drafts;
CREATE POLICY "Admins can manage cms_drafts" ON public.cms_drafts
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

