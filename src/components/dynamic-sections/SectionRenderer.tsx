import React from 'react';
import type {
  Section,
  SiteSettings,
  Project,
  Skill,
  Experience,
  Certification,
  HeroContent,
  AboutContent,
  SkillsContent,
  ExperienceContent,
  ProjectsContent,
  CertificationsContent,
  ContactContent,
} from '@/lib/supabase/types';
import {
  HeroSection,
  AboutSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  ContactSection,
} from '@/components/sections';

export interface SectionRendererProps {
  section: Section;
  index: number;
  settings?: SiteSettings | null;
  projects?: Project[];
  skills?: Skill[];
  experience?: Experience[];
  certifications?: Certification[];
  isPreview?: boolean;
}

/**
 * Dynamic Section Renderer.
 * Polymorphically maps section.type from PostgreSQL directly to its high-fidelity component implementation.
 * Ensures zero hard-coded content while rendering professional, responsive portfolio sections.
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  settings,
  projects = [],
  skills = [],
  experience = [],
  certifications = [],
  isPreview = false,
}) => {
  if (!section.enabled) {
    return null;
  }

  // In preview mode, allow draft and published sections (block archived). In public mode, only published.
  if (isPreview ? section.status === 'archived' : section.status !== 'published') {
    return null;
  }

  switch (section.type) {
    case 'hero':
      return <HeroSection content={section.content as HeroContent} settings={settings} />;

    case 'about':
      return <AboutSection content={section.content as AboutContent} settings={settings} />;

    case 'experience':
      return (
        <ExperienceSection
          content={section.content as ExperienceContent}
          experienceList={experience}
        />
      );

    case 'skills':
      return (
        <SkillsSection
          content={section.content as SkillsContent}
          skillsList={skills}
        />
      );

    case 'projects':
      return (
        <ProjectsSection
          content={section.content as ProjectsContent}
          projectsList={projects}
        />
      );

    case 'certifications':
      return (
        <CertificationsSection
          content={section.content as CertificationsContent}
          certificationsList={certifications}
        />
      );

    case 'contact':
      return (
        <ContactSection
          content={section.content as ContactContent}
          settings={settings}
        />
      );

    default:
      // Fallback for custom or unrecognized section types
      return (
        <section id={section.slug} className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8">
            <span className="text-xs font-mono text-amber-500 uppercase tracking-wider">
              {section.type}
            </span>
            <h3 className="text-xl font-bold text-slate-100 mt-2 mb-3">{section.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {typeof section.content === 'object' && section.content !== null && 'description' in section.content
                ? String((section.content as Record<string, unknown>).description)
                : 'Section content configured via CMS.'}
            </p>
          </div>
        </section>
      );
  }
};
