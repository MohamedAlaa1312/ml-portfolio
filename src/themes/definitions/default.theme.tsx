import React from 'react';
import type { ThemeDefinition, ThemeTokens } from '../types';
import { tokens as baseTokens } from '@/design-system/tokens';
import {
  Navbar,
  HeroSection,
  AboutSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  ContactSection,
  Footer,
} from '@/components/sections';

/**
 * ==============================================================================
 * BASELINE DEFAULT THEME: MODERN DEVELOPER (Phase 18)
 * 
 * Aesthetic: High-precision technical dark theme tailored for Machine Learning Engineers.
 * Features:
 * - Curated Amber & Dark Indigo palette
 * - Responsive glassmorphic surfaces & card borders
 * - Technical monospace badges & performance telemetry UI
 * - Semantic accessibility & structured headings
 * ==============================================================================
 */

export const modernDeveloperTokens: ThemeTokens = {
  colors: {
    bgPrimary: baseTokens.colors.bg.primary,
    bgSecondary: baseTokens.colors.bg.secondary,
    surface: baseTokens.colors.bg.surface,
    surfaceElevated: baseTokens.colors.bg.surfaceElevated,
    surfaceTranslucent: baseTokens.colors.bg.translucent,
    textPrimary: baseTokens.colors.text.primary,
    textSecondary: baseTokens.colors.text.secondary,
    textMuted: baseTokens.colors.text.muted,
    borderSubtle: baseTokens.colors.border.subtle,
    borderDefault: baseTokens.colors.border.default,
    borderStrong: baseTokens.colors.border.strong,
    borderFocus: baseTokens.colors.border.focus,
    accent: baseTokens.colors.accents.antiqueGold,
    accentHover: baseTokens.colors.accents.antiqueGoldHover,
    accentSecondary: baseTokens.colors.accents.burntOrange,
    success: baseTokens.colors.status.success,
    warning: baseTokens.colors.status.warning,
    error: baseTokens.colors.status.error,
  },
  typography: {
    display: baseTokens.typography.display,
    h1: baseTokens.typography.h1,
    h2: baseTokens.typography.h2,
    h3: baseTokens.typography.h3,
    h4: baseTokens.typography.h4,
    bodyLarge: baseTokens.typography.bodyLarge,
    body: baseTokens.typography.body,
    bodySmall: baseTokens.typography.bodySmall,
    caption: baseTokens.typography.caption,
    label: baseTokens.typography.label,
    navigation: baseTokens.typography.navigation,
    button: baseTokens.typography.button,
    metadata: baseTokens.typography.metadata,
  },
  spacing: {
    xs: baseTokens.spacing.xs,
    sm: baseTokens.spacing.sm,
    md: baseTokens.spacing.md,
    lg: baseTokens.spacing.lg,
    xl: baseTokens.spacing.xl,
    '2xl': baseTokens.spacing['2xl'],
    '3xl': baseTokens.spacing['3xl'],
    '4xl': baseTokens.spacing['4xl'],
  },
  shape: {
    radiusSm: baseTokens.radii.sm,
    radiusMd: baseTokens.radii.md,
    radiusLg: baseTokens.radii.lg,
    radiusXl: baseTokens.radii.xl,
    radiusFull: baseTokens.radii.full,
    shadowSm: baseTokens.shadows.sm,
    shadowMd: baseTokens.shadows.md,
    shadowLg: baseTokens.shadows.lg,
    shadowGlow: baseTokens.shadows.glow,
  },
  motion: {
    fast: baseTokens.transitions.fast,
    normal: baseTokens.transitions.normal,
    slow: baseTokens.transitions.slow,
    intensity: 'smooth',
  },
};

export const defaultTheme: ThemeDefinition = {
  id: 'modern-developer',
  name: 'Modern Developer',
  description:
    'The baseline high-precision technical dark theme tailored for Machine Learning Engineers, featuring curated amber accents, glassmorphic card surfaces, and responsive technical typography.',
  version: '1.0.0',
  previewMetadata: {
    aestheticCategory: 'technical',
    accentColorPreview: '#F59E0B',
    tags: ['Machine Learning', 'Dark Mode', 'Technical Typography', 'Glassmorphism'],
    author: 'Portfolio Core Architecture',
  },
  tokens: modernDeveloperTokens,
  layout: {
    containerMaxWidth: 'max-w-7xl',
    navPosition: 'sticky',
    sectionPadding: 'py-16 sm:py-20 md:py-24',
    gridGap: 'gap-6 sm:gap-8',
  },
  renderers: {
    NavigationRenderer: (props) => <Navbar {...props} />,
    HeroRenderer: (props) => <HeroSection content={props.content} settings={props.settings} />,
    AboutRenderer: (props) => <AboutSection content={props.content} settings={props.settings} />,
    ExperienceRenderer: (props) => (
      <ExperienceSection content={props.content} experienceList={props.experienceList} />
    ),
    SkillsRenderer: (props) => (
      <SkillsSection content={props.content} skillsList={props.skillsList} />
    ),
    ProjectsRenderer: (props) => (
      <ProjectsSection content={props.content} projectsList={props.projectsList} />
    ),
    CertificationsRenderer: (props) => (
      <CertificationsSection
        content={props.content}
        certificationsList={props.certificationsList}
      />
    ),
    ContactRenderer: (props) => (
      <ContactSection content={props.content} settings={props.settings} />
    ),
    FooterRenderer: (props) => <Footer {...props} />,
    CustomSectionRenderer: ({ section }) => (
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
    ),
  },
};
