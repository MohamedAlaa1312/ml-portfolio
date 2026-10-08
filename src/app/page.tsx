import React from 'react';
import type { Metadata } from 'next';
import { CmsService } from '@/services/cms.service';
import { ThemeService, ThemedSectionRenderer } from '@/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await CmsService.getSiteSettings().catch(() => null);
  const siteName = settings?.site_name || settings?.name || 'Mohamed Alaa';
  const title = settings?.seo_title || `${siteName} | Machine Learning Engineer Portfolio`;
  const description =
    settings?.seo_description ||
    settings?.site_description ||
    'Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, data science pipelines, and verified certifications.';
  const allowIndexing = settings?.allow_indexing !== false;
  const faviconUrl = settings?.favicon_url || settings?.favicon || '/favicon.ico';

  const productionOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://ml-portfolio-theta.vercel.app';

  const rawOg = settings?.og_image_url || settings?.og_image || '/images/og-preview.jpg';
  const absoluteOgImageUrl = rawOg.startsWith('http')
    ? rawOg
    : `${productionOrigin}${rawOg.startsWith('/') ? '' : '/'}${rawOg}`;

  return {
    title,
    description,
    metadataBase: new URL(productionOrigin),
    alternates: {
      canonical: settings?.canonical_url?.startsWith('http') ? settings.canonical_url : productionOrigin,
    },
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title,
      description,
      url: productionOrigin,
      siteName: settings?.site_name || `${siteName} Portfolio`,
      images: [
        {
          url: absoluteOgImageUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} — Machine Learning Engineer Portfolio`,
          type: 'image/jpeg',
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteOgImageUrl],
      creator: '@MohamedAlaa',
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
        name={siteSettings?.name || 'Mohamed Alaa'}
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
        name={siteSettings?.name || 'Mohamed Alaa'}
        role={siteSettings?.professional_title || 'Machine Learning Engineer'}
        sections={visibleSections}
      />
    </div>
  );
}
