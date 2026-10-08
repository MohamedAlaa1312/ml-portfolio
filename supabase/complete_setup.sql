-- ==============================================================================
-- MACHINE LEARNING ENGINEER PORTFOLIO — COMPLETE DATABASE SETUP
-- Target Project: https://catdhhhimxifogafjbdw.supabase.co
-- ==============================================================================

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



-- ==============================================================================
-- INITIAL SEED CONTENT
-- ==============================================================================

-- ==============================================================================
-- MACHINE LEARNING ENGINEER PORTFOLIO — SEED DATA (PHASE 1)
-- Includes published, draft, and disabled items to verify RLS filtering
-- ==============================================================================

-- 1. SEED SITE SETTINGS
INSERT INTO public.site_settings (
    name,
    title,
    professional_title,
    subtitle,
    bio,
    email,
    phone,
    location,
    social_links,
    hero_title,
    hero_subtitle,
    resume_url,
    seo_title,
    seo_description
) VALUES (
    'Mohamed Khaled',
    'Machine Learning Engineer',
    'Machine Learning Engineer',
    'Turning Data Into Intelligent Solutions',
    'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.',
    'mohamed@example.com',
    '+20 100 123 4567',
    'Cairo, Egypt',
    '{
        "linkedin": "https://linkedin.com",
        "github": "https://github.com",
        "x": "https://x.com",
        "email": "mailto:mohamed@example.com"
    }'::jsonb,
    'Mohamed Khaled',
    'Machine Learning Engineer',
    '/documents/resume.pdf',
    'Mohamed Khaled | Machine Learning Engineer Portfolio',
    'Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, data science pipelines, and verified certifications.'
)
ON CONFLICT ((true)) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    professional_title = EXCLUDED.professional_title,
    subtitle = EXCLUDED.subtitle,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    social_links = EXCLUDED.social_links;

-- 2. SEED DYNAMIC SECTIONS
INSERT INTO public.sections (type, title, slug, content, display_order, enabled, status)
VALUES
(
    'hero',
    'Hero Section',
    'hero',
    '{
        "greeting": "Hello, I''m",
        "badge": "Machine Learning Engineer",
        "summary": "I build intelligent systems using data, machine learning and modern technologies. Passionate about solving real-world problems and creating impactful solutions.",
        "primaryCta": { "label": "View My Projects", "anchor": "#projects" },
        "secondaryCta": { "label": "Contact Me", "anchor": "#contact" }
    }'::jsonb,
    1,
    true,
    'published'
),
(
    'about',
    'About Me',
    'about',
    '{
        "badge": "About Me",
        "heading": "Turning Data Into Intelligent Solutions",
        "description": "I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.",
        "pillars": [
            { "title": "Problem Solver", "description": "Finds effective solutions" },
            { "title": "Continuous Learner", "description": "Always exploring" },
            { "title": "Team Player", "description": "Builds great products" }
        ]
    }'::jsonb,
    2,
    true,
    'published'
),
(
    'experience',
    'Experience',
    'experience',
    '{
        "badge": "Career",
        "title": "Experience",
        "subtitle": "My professional journey in building data-driven solutions and working on impactful projects."
    }'::jsonb,
    3,
    true,
    'published'
),
(
    'skills',
    'Skills',
    'skills',
    '{
        "badge": "Capabilities",
        "title": "Skills",
        "subtitle": "Tools and technologies I work with."
    }'::jsonb,
    4,
    true,
    'published'
),
(
    'projects',
    'Featured Projects',
    'projects',
    '{
        "badge": "Portfolio",
        "title": "Featured Projects",
        "subtitle": "A collection of projects that showcase my skills and experience in machine learning and software engineering."
    }'::jsonb,
    5,
    true,
    'published'
),
(
    'certifications',
    'Certifications',
    'certifications',
    '{
        "badge": "Credentials",
        "title": "Certifications",
        "subtitle": "Relevant certifications that validate my skills and knowledge."
    }'::jsonb,
    6,
    true,
    'published'
),
(
    'contact',
    'Get In Touch',
    'contact',
    '{
        "badge": "Contact",
        "title": "Get In Touch",
        "subtitle": "Feel free to reach out for collaborations, opportunities or just to say hello!"
    }'::jsonb,
    7,
    true,
    'published'
),
-- Draft Section (Must be hidden from public visitors)
(
    'custom',
    'Experimental Research Laboratory',
    'research-lab',
    '{"badge": "Research", "title": "Ongoing AI Experiments", "status": "WIP"}'::jsonb,
    8,
    true,
    'draft'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    enabled = EXCLUDED.enabled,
    status = EXCLUDED.status;

-- 3. SEED SKILLS
INSERT INTO public.skills (name, category, proficiency, display_order, enabled) VALUES
-- Machine Learning
('Scikit-learn', 'Machine Learning', 95, 1, true),
('TensorFlow', 'Machine Learning', 90, 2, true),
('PyTorch', 'Machine Learning', 92, 3, true),
('Keras', 'Machine Learning', 88, 4, true),

-- Programming
('Python', 'Programming', 98, 5, true),
('Java', 'Programming', 80, 6, true),
('C++', 'Programming', 75, 7, true),
('TypeScript', 'Programming', 85, 8, true),

-- Data Science
('Pandas', 'Data Science', 95, 9, true),
('NumPy', 'Data Science', 95, 10, true),
('Matplotlib', 'Data Science', 88, 11, true),
('Seaborn', 'Data Science', 88, 12, true),

-- Backend
('FastAPI', 'Backend', 92, 13, true),
('Django', 'Backend', 85, 14, true),
('Node.js', 'Backend', 82, 15, true),
('Express', 'Backend', 80, 16, true),

-- Databases
('PostgreSQL', 'Databases', 90, 17, true),
('MongoDB', 'Databases', 85, 18, true),
('MySQL', 'Databases', 82, 19, true),
('Redis', 'Databases', 80, 20, true),

-- Tools
('Docker', 'Tools', 88, 21, true),
('Git', 'Tools', 95, 22, true),
('Linux', 'Tools', 90, 23, true),
('Jupyter', 'Tools', 96, 24, true),

-- Disabled Skill (Must be hidden from public visitors)
('Legacy Fortran', 'Programming', 40, 99, false);

-- 4. SEED EXPERIENCE
INSERT INTO public.experience (company, role, employment_type, location, start_date, end_date, is_current, current_position, description, responsibilities, technologies, achievements, display_order, enabled, status)
VALUES
(
    'Google',
    'Machine Learning Engineer',
    'Full-time',
    'Remote',
    '2022-01-01',
    NULL,
    true,
    true,
    'Developed and deployed production-grade machine learning models serving millions of queries.',
    ARRAY[
        'Developed and deployed ML models for large-scale applications.',
        'Improved model performance and reduced inference latency by 40%.',
        'Collaborated with cross-functional teams to deliver high-impact AI features.'
    ],
    ARRAY['Python', 'TensorFlow', 'Kubernetes', 'GCP'],
    ARRAY['Reduced inference latency by 40%', 'Scaled model inference to 10M+ requests/day'],
    1,
    true,
    'published'
),
(
    'Microsoft',
    'Data Scientist',
    'Full-time',
    'Remote',
    '2020-06-01',
    '2021-12-31',
    false,
    false,
    'Built enterprise data pipelines and machine learning models for business intelligence.',
    ARRAY[
        'Built data pipelines and machine learning models for business intelligence.',
        'Worked on NLP and recommendation systems across customer datasets.',
        'Optimized data processing workflows and distributed model training pipelines.'
    ],
    ARRAY['Python', 'PyTorch', 'Azure ML', 'Spark'],
    ARRAY['Engineered predictive churn models with 92% precision'],
    2,
    true,
    'published'
),
(
    'Amazon',
    'Machine Learning Intern',
    'Internship',
    'Seattle, USA',
    '2019-07-01',
    '2019-09-30',
    false,
    false,
    'Assisted in research and prototyping of personalization algorithms.',
    ARRAY[
        'Assisted in developing ML models for personalized product recommendation.',
        'Analyzed large datasets and created visual data insights for product teams.',
        'Conducted experimental ablation studies on neural collaborative filtering.'
    ],
    ARRAY['Python', 'Scikit-learn', 'AWS', 'Pandas'],
    ARRAY['Published internal benchmark study on recommendation latency'],
    3,
    true,
    'published'
);

-- 5. SEED PROJECTS
INSERT INTO public.projects (title, slug, short_description, full_description, technologies, github_url, live_url, featured, display_order, status)
VALUES
(
    'Fake News Detection',
    'fake-news-detection',
    'ML model to detect fake news using NLP and transformer models.',
    'A state-of-the-art Natural Language Processing pipeline leveraging BERT and transformer architectures to classify misinformation in online media articles with high accuracy.',
    ARRAY['Python', 'TensorFlow', 'NLP', 'Transformers'],
    'https://github.com/example/fake-news-detection',
    'https://demo.example.com/fake-news',
    true,
    1,
    'published'
),
(
    'Image Classification',
    'image-classification',
    'Deep learning model for image classification using CNNs.',
    'Convolutional Neural Network system fine-tuned on custom visual datasets for robust real-time object classification and feature extraction.',
    ARRAY['Python', 'PyTorch', 'Computer Vision', 'OpenCV'],
    'https://github.com/example/image-classification',
    'https://demo.example.com/image-clf',
    true,
    2,
    'published'
),
(
    'Recommendation System',
    'recommendation-system',
    'Personalized product recommendations using collaborative filtering.',
    'Hybrid recommendation engine combining collaborative filtering and matrix factorization to deliver real-time personalized recommendations.',
    ARRAY['Python', 'Scikit-learn', 'Data Science', 'FastAPI'],
    'https://github.com/example/recommendation-system',
    'https://demo.example.com/recsys',
    true,
    3,
    'published'
),
(
    'Data Pipeline',
    'data-pipeline',
    'End-to-end data pipeline for processing and analyzing large datasets.',
    'Scalable, fault-tolerant ETL and streaming data pipeline built with Apache Airflow and Kafka for continuous machine learning model training.',
    ARRAY['Python', 'Airflow', 'Big Data', 'Docker'],
    'https://github.com/example/data-pipeline',
    'https://demo.example.com/pipeline',
    true,
    4,
    'published'
),
-- Draft Project (Must be hidden from public visitors)
(
    'Autonomous Drone Navigation',
    'autonomous-drone-navigation',
    'Reinforcement learning for obstacle avoidance.',
    'PPO agent trained in Isaac Gym for real-time obstacle avoidance.',
    ARRAY['Python', 'PyTorch', 'RL', 'Simulation'],
    'https://github.com/example/drone-rl',
    NULL,
    false,
    5,
    'draft'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    technologies = EXCLUDED.technologies,
    featured = EXCLUDED.featured,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status;

-- 6. SEED CERTIFICATIONS
INSERT INTO public.certifications (title, issuer, issue_date, credential_id, credential_url, description, display_order, status)
VALUES
(
    'Machine Learning Specialization',
    'Coursera',
    '2022-03-15',
    'AB0123',
    'https://coursera.org/verify/AB0123',
    'Comprehensive mastery of supervised learning, advanced algorithms, and unsupervised learning.',
    1,
    'published'
),
(
    'Deep Learning with PyTorch',
    'Udemy',
    '2021-11-20',
    'DEF456',
    'https://udemy.com/certificate/DEF456',
    'In-depth practical experience with deep neural networks, CNNs, RNNs, and GANs in PyTorch.',
    2,
    'published'
),
(
    'Python for Data Science',
    'DataCamp',
    '2021-08-10',
    'GH1789',
    'https://datacamp.com/statement/GH1789',
    'Advanced data wrangling, statistical inference, visualization, and algorithmic modeling in Python.',
    3,
    'published'
),
(
    'AZ-900: Microsoft Azure Fundamentals',
    'Microsoft',
    '2021-06-05',
    'JKL012',
    'https://microsoft.com/credentials/JKL012',
    'Foundational cloud computing architectural concepts, security, privacy, and compliance.',
    4,
    'published'
),
-- Archived Certification (Must be hidden from public visitors)
(
    'Legacy ITIL v3 Foundation',
    'AXELOS',
    '2018-01-15',
    'ARCH-001',
    NULL,
    'Deprecated IT service management certification.',
    99,
    'archived'
);


-- ==============================================================================
-- ADMINISTRATOR AUTHORIZATION
-- ==============================================================================

-- ==============================================================================
-- PHASE 16 — ADMINISTRATOR AUTHORIZATION SCRIPT
-- Target Account: mohamed13alaa12@gmail.com
-- ==============================================================================
-- Security Principle:
-- User authentication is handled exclusively by Supabase Auth (auth.users).
-- User authorization is verified through public.admin_users (user_id = auth.uid())
-- and JWT app_metadata.role = 'admin'.
--
-- This script safely links the user's stable UUID to the admin_users table
-- without hardcoding passwords, emails in application code, or altering schemas.
-- ==============================================================================

DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT := 'mohamed13alaa12@gmail.com';
BEGIN
    -- 1. Locate user in auth.users (case-insensitive)
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE lower(email) = lower(target_email);

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User "%" not found in auth.users. Please create the user first in Supabase Dashboard (Authentication -> Users -> Add User) or via setup-admin script.', target_email;
    ELSE
        -- 2. Ensure public.admin_users table exists
        CREATE TABLE IF NOT EXISTS public.admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- 3. Insert or update Admin authorization record
        INSERT INTO public.admin_users (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

        -- 4. Sync app_metadata in auth.users for fast-path JWT role verification
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE id = target_user_id;

        RAISE NOTICE 'SUCCESS: User "%" (UUID: %) has been authorized as Administrator in public.admin_users.', target_email, target_user_id;
    END IF;
END $$;

-- 5. Verification Query: Confirm Administrator authorization status
SELECT
    u.id AS auth_user_id,
    u.email,
    u.created_at AS user_created_at,
    a.role AS admin_role,
    a.created_at AS authorized_at
FROM auth.users u
JOIN public.admin_users a ON u.id = a.user_id
WHERE lower(u.email) = lower('mohamed13alaa12@gmail.com');
