import React from 'react';
import type { ThemeDefinition } from '../types';
import { structuredMonochromeTokens } from './tokens';
import { MonochromeNavbar } from './components/MonochromeNavbar';
import { MonochromeHero } from './components/MonochromeHero';
import { MonochromeAbout } from './components/MonochromeAbout';
import { MonochromeExperience } from './components/MonochromeExperience';
import { MonochromeSkills } from './components/MonochromeSkills';
import { MonochromeProjects } from './components/MonochromeProjects';
import { MonochromeCertifications } from './components/MonochromeCertifications';
import { MonochromeContact } from './components/MonochromeContact';
import { MonochromeFooter } from './components/MonochromeFooter';

/**
 * ==============================================================================
 * THEME 3: STRUCTURED MONOCHROME
 * 
 * ID: structured-monochrome
 * Version: 1.0.0
 * Aesthetic: Architectural, editorial, bold monochrome typography.
 * Pure black (#050505), high contrast crisp white (#FFFFFF), and neutral grays.
 * Structured geometry, fine hairline dividers, and minimal ornamentation.
 * ==============================================================================
 */

export const structuredMonochromeTheme: ThemeDefinition = {
  id: 'structured-monochrome',
  name: 'Structured Monochrome',
  description:
    'A bold monochrome portfolio theme focused on typography, structure, precision, and technical case-study presentation.',
  version: '1.0.0',
  previewMetadata: {
    aestheticCategory: 'minimal',
    accentColorPreview: '#FFFFFF',
    tags: ['Monochrome', 'Architectural', 'Typographic', 'Editorial', 'High-Contrast'],
    author: 'Portfolio Core Architecture',
  },
  tokens: structuredMonochromeTokens,
  layout: {
    containerMaxWidth: 'max-w-7xl',
    navPosition: 'sticky',
    sectionPadding: 'py-20 sm:py-24 lg:py-32',
    gridGap: 'gap-8 sm:gap-12',
  },
  renderers: {
    NavigationRenderer: (props) => <MonochromeNavbar {...props} />,
    HeroRenderer: (props) => (
      <MonochromeHero
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    AboutRenderer: (props) => (
      <MonochromeAbout
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    ExperienceRenderer: (props) => (
      <MonochromeExperience
        content={props.content}
        experienceList={props.experienceList}
        sectionIndex={props.sectionIndex}
      />
    ),
    SkillsRenderer: (props) => (
      <MonochromeSkills
        content={props.content}
        skillsList={props.skillsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    ProjectsRenderer: (props) => (
      <MonochromeProjects
        content={props.content}
        projectsList={props.projectsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    CertificationsRenderer: (props) => (
      <MonochromeCertifications
        content={props.content}
        certificationsList={props.certificationsList}
        sectionIndex={props.sectionIndex}
      />
    ),
    ContactRenderer: (props) => (
      <MonochromeContact
        content={props.content}
        settings={props.settings}
        sectionIndex={props.sectionIndex}
      />
    ),
    FooterRenderer: (props) => <MonochromeFooter {...props} />,
    CustomSectionRenderer: ({ section, sectionIndex }) => {
      const secNum = String(sectionIndex ?? 0).padStart(2, '0');
      return (
        <section
          id={section.slug}
          className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.15]"
        >
          <div className="p-8 border border-white/20 bg-[#0A0A0A]">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#737373] pb-3 mb-4 border-b border-white/10">
              <span className="text-white font-bold">{secNum} — CUSTOM MODULE</span>
              <span className="text-white/60">{section.type}</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
              {section.title}
            </h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-3xl">
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
