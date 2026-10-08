import React from 'react';
import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';
import { PreviewService } from '@/services/preview.service';
import { PreviewBanner } from '@/components/preview/PreviewBanner';
import { ThemeService, ThemedSectionRenderer } from '@/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Preview Page (/admin/preview)
 * Renders the portfolio dynamically with draft overlays for all CMS entities.
 * Strictly guarded for authorized administrators only.
 */
interface AdminPreviewPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPreviewPage(props: AdminPreviewPageProps) {
  // 1. Server-side Defense-in-Depth Authorization
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    redirect('/admin/login?error=unauthorized');
  }

  const resolvedParams = props.searchParams ? await props.searchParams : undefined;
  const requestedTheme =
    typeof resolvedParams?.theme === 'string'
      ? resolvedParams.theme
      : typeof resolvedParams?.preview_theme === 'string'
      ? resolvedParams.preview_theme
      : undefined;

  // 2. Fetch synthesized preview data with draft overlay
  const previewData = await PreviewService.getPreviewData();
  const { siteSettings, sections, projects, skills, experience, certifications, draftCount, drafts } =
    previewData;

  // 3. Resolve Theme for Preview
  const activeTheme = await ThemeService.getActiveTheme(
    requestedTheme
      ? { previewThemeId: requestedTheme }
      : siteSettings?.active_theme
      ? { previewThemeId: siteSettings.active_theme }
      : undefined
  );
  const { renderers } = activeTheme;

  const visibleSections = sections.filter((s) => s.enabled && s.status !== 'archived');
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
      {/* 1. Preview Mode Header Banner */}
      <PreviewBanner draftCount={draftCount} drafts={drafts} />

      {/* 2. Public Navigation (Resolved dynamically using preview sections) */}
      <renderers.NavigationRenderer
        name={siteSettings?.name || 'Mohamed Alaa'}
        role={siteSettings?.professional_title || 'Machine Learning Engineer'}
        resumeUrl={siteSettings?.resume_url || '/documents/resume.pdf'}
        sections={visibleSections}
      />

      {/* 3. Main Content Pipeline (Rendered in preview order with draft content) */}
      <main className="flex-1">
        {hasDynamicSections ? (
          <div className="space-y-0">
            {visibleSections.map((section, idx) => (
              <ThemedSectionRenderer
                key={section.id || section.slug}
                section={section}
                theme={activeTheme}
                index={idx}
                settings={siteSettings}
                projects={projects}
                skills={skills}
                experience={experience}
                certifications={certifications}
                isPreview={true}
              />
            ))}
          </div>
        ) : (
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

      {/* 4. Footer */}
      <renderers.FooterRenderer
        name={siteSettings?.name || 'Mohamed Alaa'}
        role={siteSettings?.professional_title || 'Machine Learning Engineer'}
        sections={visibleSections}
      />
    </div>
  );
}
