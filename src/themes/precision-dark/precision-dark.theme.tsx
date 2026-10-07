import React from 'react';
import type { ThemeDefinition } from '../types';
import { precisionDarkTokens } from './tokens';
import { PrecisionNavbar } from './components/PrecisionNavbar';
import { PrecisionHero } from './components/PrecisionHero';
import { PrecisionAbout } from './components/PrecisionAbout';
import { PrecisionExperience } from './components/PrecisionExperience';
import { PrecisionSkills } from './components/PrecisionSkills';
import { PrecisionProjects } from './components/PrecisionProjects';
import { PrecisionCertifications } from './components/PrecisionCertifications';
import { PrecisionContact } from './components/PrecisionContact';
import { PrecisionFooter } from './components/PrecisionFooter';

/**
 * ==============================================================================
 * THEME 2: PRECISION DARK PORTFOLIO
 * 
 * ID: precision-dark
 * Version: 1.0.0
 * Aesthetic: Modern engineering lab & architectural technical documentation.
 * Deep graphite foundation (#08090B), high-contrast cool white typography (#F1F5F9),
 * and restrained technical amber accents (#F59E0B).
 * ==============================================================================
 */

export const precisionDarkTheme: ThemeDefinition = {
  id: 'precision-dark',
  name: 'Precision Dark Portfolio',
  description:
    'A dark, structured, precision-focused portfolio theme designed for technical and machine learning engineering presentation.',
  version: '1.0.0',
  previewMetadata: {
    aestheticCategory: 'technical',
    accentColorPreview: '#F59E0B',
    tags: ['Architectural', 'Machine Learning', 'Graphite', 'Precision', 'Telemetry'],
    author: 'Portfolio Core Architecture',
  },
  tokens: precisionDarkTokens,
  layout: {
    containerMaxWidth: 'max-w-7xl',
    navPosition: 'sticky',
    sectionPadding: 'py-16 sm:py-20 lg:py-24',
    gridGap: 'gap-6 sm:gap-8',
  },
  renderers: {
    NavigationRenderer: (props) => <PrecisionNavbar {...props} />,
    HeroRenderer: (props) => (
      <PrecisionHero
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    AboutRenderer: (props) => (
      <PrecisionAbout
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    ExperienceRenderer: (props) => (
      <PrecisionExperience
        content={props.content}
        experienceList={props.experienceList}
        sectionIndex={props.sectionIndex}
      />
    ),
    SkillsRenderer: (props) => (
      <PrecisionSkills
        content={props.content}
        skillsList={props.skillsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    ProjectsRenderer: (props) => (
      <PrecisionProjects
        content={props.content}
        projectsList={props.projectsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    CertificationsRenderer: (props) => (
      <PrecisionCertifications
        content={props.content}
        certificationsList={props.certificationsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    ContactRenderer: (props) => (
      <PrecisionContact
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    FooterRenderer: (props) => <PrecisionFooter {...props} />,
    CustomSectionRenderer: ({ section, sectionIndex }) => {
      const secNum = String((sectionIndex ?? 0) + 1).padStart(2, '0');
      return (
        <section
          id={section.slug}
          className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.10]"
        >
          <div className="p-6 rounded-sm bg-[#0E1014] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pb-2 mb-3 border-b border-white/[0.06]">
              <span>{`[${secNum}]`} {'//'} CUSTOM MODULE</span>
              <span className="text-[#F59E0B] uppercase">{section.type}</span>
            </div>
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-2 font-mono">
              {section.title}
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {typeof section.content === 'object' && section.content !== null && 'description' in section.content
                ? String((section.content as Record<string, unknown>).description)
                : 'Section content configured via CMS.'}
            </p>
          </div>
        </section>
      );
    },
  },
};
