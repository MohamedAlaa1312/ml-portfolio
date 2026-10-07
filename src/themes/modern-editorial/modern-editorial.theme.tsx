import React from 'react';
import type { ThemeDefinition } from '../types';
import { modernEditorialTokens } from './tokens';
import { EditorialNavbar } from './components/EditorialNavbar';
import { EditorialHero } from './components/EditorialHero';
import { EditorialAbout } from './components/EditorialAbout';
import { EditorialExperience } from './components/EditorialExperience';
import { EditorialSkills } from './components/EditorialSkills';
import { EditorialProjects } from './components/EditorialProjects';
import { EditorialCertifications } from './components/EditorialCertifications';
import { EditorialContact } from './components/EditorialContact';
import { EditorialFooter } from './components/EditorialFooter';

/**
 * ==============================================================================
 * THEME 1: MODERN TECHNICAL EDITORIAL
 * 
 * ID: modern-editorial
 * Version: 1.0.0
 * Aesthetic: Premium technical publication / engineer's personal journal.
 * High-precision typography, deep charcoal foundation, warm off-white body text,
 * and restrained burnt orange / copper accents.
 * ==============================================================================
 */

export const modernEditorialTheme: ThemeDefinition = {
  id: 'modern-editorial',
  name: 'Modern Technical Editorial',
  description:
    'A professional editorial-style portfolio theme designed for technical and machine learning engineering portfolios.',
  version: '1.0.0',
  previewMetadata: {
    aestheticCategory: 'editorial',
    accentColorPreview: '#C25E34',
    tags: ['Editorial', 'Machine Learning', 'Technical Typography', 'Minimalism', 'Precision'],
    author: 'Portfolio Core Architecture',
  },
  tokens: modernEditorialTokens,
  layout: {
    containerMaxWidth: 'max-w-7xl',
    navPosition: 'sticky',
    sectionPadding: 'py-20 sm:py-24 md:py-32',
    gridGap: 'gap-8 sm:gap-12',
  },
  renderers: {
    NavigationRenderer: (props) => <EditorialNavbar {...props} />,
    HeroRenderer: (props) => <EditorialHero content={props.content} settings={props.settings} />,
    AboutRenderer: (props) => <EditorialAbout content={props.content} settings={props.settings} />,
    ExperienceRenderer: (props) => (
      <EditorialExperience content={props.content} experienceList={props.experienceList} />
    ),
    SkillsRenderer: (props) => (
      <EditorialSkills content={props.content} skillsList={props.skillsList} />
    ),
    ProjectsRenderer: (props) => (
      <EditorialProjects content={props.content} projectsList={props.projectsList} />
    ),
    CertificationsRenderer: (props) => (
      <EditorialCertifications
        content={props.content}
        certificationsList={props.certificationsList}
      />
    ),
    ContactRenderer: (props) => (
      <EditorialContact content={props.content} settings={props.settings} />
    ),
    FooterRenderer: (props) => <EditorialFooter {...props} />,
    CustomSectionRenderer: ({ section }) => (
      <section
        id={section.slug}
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.08]"
      >
        <div className="p-8 rounded bg-[#121417] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#C25E34] uppercase tracking-widest">
            {section.type} {'//'} CUSTOM
          </span>
          <h3 className="text-xl font-semibold text-[#EDEDEC] mt-2 mb-3">
            {section.title}
          </h3>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            {typeof section.content === 'object' && section.content !== null && 'description' in section.content
              ? String((section.content as Record<string, unknown>).description)
              : 'Section content configured via CMS.'}
          </p>
        </div>
      </section>
    ),
  },
};
