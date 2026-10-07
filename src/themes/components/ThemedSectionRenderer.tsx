import React from 'react';
import type { ThemeDefinition } from '../types';
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

export interface ThemedSectionRendererProps {
  section: Section;
  theme: ThemeDefinition;
  index?: number;
  settings?: SiteSettings | null;
  projects?: Project[];
  skills?: Skill[];
  experience?: Experience[];
  certifications?: Certification[];
  isPreview?: boolean;
}

/**
 * ==============================================================================
 * THEMED SECTION RENDERER (Phase 18)
 * 
 * Dynamically resolves section rendering through the active ThemeDefinition.
 * Separates Content & Section Sequence from Theme-Specific Visual Presentation.
 * ==============================================================================
 */
export const ThemedSectionRenderer: React.FC<ThemedSectionRendererProps> = ({
  section,
  theme,
  index,
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

  // Filter archived in preview; filter non-published in public mode
  if (isPreview ? section.status === 'archived' : section.status !== 'published') {
    return null;
  }

  const { renderers } = theme;

  switch (section.type) {
    case 'hero':
      return <renderers.HeroRenderer content={section.content as HeroContent} settings={settings} sectionIndex={index} />;

    case 'about':
      return <renderers.AboutRenderer content={section.content as AboutContent} settings={settings} sectionIndex={index} />;

    case 'experience':
      return (
        <renderers.ExperienceRenderer
          content={section.content as ExperienceContent}
          experienceList={experience}
          sectionIndex={index}
        />
      );

    case 'skills':
      return (
        <renderers.SkillsRenderer
          content={section.content as SkillsContent}
          skillsList={skills}
          sectionIndex={index}
        />
      );

    case 'projects':
      return (
        <renderers.ProjectsRenderer
          content={section.content as ProjectsContent}
          projectsList={projects}
          sectionIndex={index}
        />
      );

    case 'certifications':
      return (
        <renderers.CertificationsRenderer
          content={section.content as CertificationsContent}
          certificationsList={certifications}
          sectionIndex={index}
        />
      );

    case 'contact':
      return (
        <renderers.ContactRenderer
          content={section.content as ContactContent}
          settings={settings}
          sectionIndex={index}
        />
      );

    default:
      if (renderers.CustomSectionRenderer) {
        return <renderers.CustomSectionRenderer section={section} settings={settings} sectionIndex={index} />;
      }

      // Default generic fallback
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
