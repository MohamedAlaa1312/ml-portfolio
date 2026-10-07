import React from 'react';
import type { Metadata } from 'next';
import { CmsService } from '@/services/cms.service';
import { ThemeService, ThemedSectionRenderer } from '@/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await CmsService.getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || settings?.name || 'Mohamed Khaled';
  const title = settings?.seo_title || `${siteName} | Machine Learning Engineer`;
  const description =
    settings?.seo_description ||
    settings?.site_description ||
    'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.';
  const canonicalUrl = settings?.canonical_url || 'https://mohamedkhaled.dev';
  const allowIndexing = settings?.allow_indexing !== false;
  const ogImageUrl = settings?.og_image_url || settings?.og_image || settings?.profile_image || '/images/profile.jpg';
  const faviconUrl = settings?.favicon_url || settings?.favicon || '/favicon.ico';

  const validBaseUrl = canonicalUrl.startsWith('http') ? canonicalUrl : 'https://mohamedkhaled.dev';

  return {
    title,
    description,
    metadataBase: new URL(validBaseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      images: [
        {
          url: ogImageUrl,
          alt: title,
        },
      ],
      type: 'website',
    },
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
    },
  };
}

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage(props: HomePageProps) {
  const resolvedParams = props.searchParams ? await props.searchParams : undefined;
  const requestedTheme =
    typeof resolvedParams?.theme === 'string'
      ? resolvedParams.theme
      : typeof resolvedParams?.preview_theme === 'string'
      ? resolvedParams.preview_theme
      : undefined;

  // Fetch all published CMS data in parallel with resilient error handling
  let siteSettings = null;
  let sections: Awaited<ReturnType<typeof CmsService.getPublishedSections>> = [];
  let projects: Awaited<ReturnType<typeof CmsService.getPublishedProjects>> = [];
  let skills: Awaited<ReturnType<typeof CmsService.getEnabledSkills>> = [];
  let experience: Awaited<ReturnType<typeof CmsService.getPublishedExperience>> = [];
  let certifications: Awaited<ReturnType<typeof CmsService.getPublishedCertifications>> = [];

  try {
    const results = await Promise.all([
      CmsService.getSiteSettings().catch(() => null),
      CmsService.getPublishedSections().catch(() => []),
      CmsService.getPublishedProjects().catch(() => []),
      CmsService.getEnabledSkills().catch(() => []),
      CmsService.getPublishedExperience().catch(() => []),
      CmsService.getPublishedCertifications().catch(() => []),
    ]);

    siteSettings = results[0];
    sections = results[1] || [];
    projects = results[2] || [];
    skills = results[3] || [];
    experience = results[4] || [];
    certifications = results[5] || [];
  } catch {
    // Gracefully proceed with safe default fallbacks
  }

  // Resolve Authoritative Active Theme (Phase 18, 19, 20)
  const activeTheme = await ThemeService.getActiveTheme(
    requestedTheme ? { previewThemeId: requestedTheme } : undefined
  );
  const { renderers } = activeTheme;

  const visibleSections = sections.filter((s) => s.enabled && s.status === 'published');
  const hasDynamicSections = visibleSections.length > 0;

  let themeContainerClass = "min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden w-full";
  if (activeTheme.id === 'modern-editorial') {
    themeContainerClass = "min-h-screen bg-[#0C0D0E] text-[#EDEDEC] flex flex-col font-sans selection:bg-[#C25E34]/30 selection:text-[#EDEDEC] overflow-x-hidden w-full";
  } else if (activeTheme.id === 'precision-dark') {
    themeContainerClass = "min-h-screen bg-[#08090B] text-[#F1F5F9] flex flex-col font-sans selection:bg-amber-500/25 selection:text-amber-200 overflow-x-hidden w-full";
  } else if (activeTheme.id === 'structured-monochrome') {
    themeContainerClass = "min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden w-full";
  }

  return (
    <div
      data-theme={activeTheme.id}
      className={themeContainerClass}
    >
      {/* 1. Header Navigation via Active Theme */}
      <renderers.NavigationRenderer
        name={siteSettings?.name || 'Mohamed Khaled'}
        role={siteSettings?.professional_title || 'Machine Learning Engineer'}
        resumeUrl={siteSettings?.resume_url || '/documents/resume.pdf'}
        logoUrl={siteSettings?.logo_url || siteSettings?.logo || null}
        siteName={siteSettings?.site_name || siteSettings?.name}
        sections={visibleSections}
      />

      {/* 2. Main Content Pipeline via Active Theme */}
      <main className="flex-1">
        {hasDynamicSections ? (
          // CMS-Driven Dynamic Section Sequence rendered through Active Theme
          <div className="space-y-0">
            {visibleSections.map((section, idx) => (
              <ThemedSectionRenderer
                key={section.id}
                section={section}
                theme={activeTheme}
                index={idx}
                settings={siteSettings}
                projects={projects}
                skills={skills}
                experience={experience}
                certifications={certifications}
              />
            ))}
          </div>
        ) : (
          // Default Complete Section Pipeline (Seed Persona Data) rendered through Active Theme
          <div className="space-y-0">
            <renderers.HeroRenderer settings={siteSettings} />
            <renderers.AboutRenderer settings={siteSettings} />
            <renderers.ExperienceRenderer experienceList={experience} />
            <renderers.SkillsRenderer skillsList={skills} />
            <renderers.ProjectsRenderer projectsList={projects} />
            <renderers.CertificationsRenderer certificationsList={certifications} />
            <renderers.ContactRenderer settings={siteSettings} />
          </div>
        )}
      </main>

      {/* 3. Footer via Active Theme */}
      <renderers.FooterRenderer
        name={siteSettings?.name || 'Mohamed Khaled'}
        role={siteSettings?.professional_title || 'Machine Learning Engineer'}
        sections={visibleSections}
      />
    </div>
  );
}
