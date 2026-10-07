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

/**
 * ==============================================================================
 * THEME CONTRACT & PRESENTATION INTERFACES (Phase 18)
 * Separates Content (CMS) from Layout Structure (Sections) from Presentation (Themes)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. THEME TOKENS
// ------------------------------------------------------------------------------

export interface ThemeColorTokens {
  bgPrimary: string;
  bgSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceTranslucent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  borderFocus: string;
  accent: string;
  accentHover: string;
  accentSecondary?: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypographyTokens {
  display: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  bodyLarge: string;
  body: string;
  bodySmall: string;
  caption: string;
  label: string;
  navigation: string;
  button: string;
  metadata: string;
}

export interface ThemeSpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeShapeTokens {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusFull: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowGlow?: string;
}

export interface ThemeMotionTokens {
  fast: string;
  normal: string;
  slow: string;
  intensity?: 'minimal' | 'smooth' | 'expressive';
}

export interface ThemeTokens {
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
  spacing: ThemeSpacingTokens;
  shape: ThemeShapeTokens;
  motion: ThemeMotionTokens;
}

// ------------------------------------------------------------------------------
// 2. THEME LAYOUT CONFIGURATION
// ------------------------------------------------------------------------------

export interface ThemeLayoutConfig {
  containerMaxWidth: string; // e.g. 'max-w-7xl'
  navPosition: 'fixed-top' | 'sticky' | 'floating';
  sectionPadding: string; // e.g. 'py-16 sm:py-20 md:py-24'
  gridGap: string;
}

// ------------------------------------------------------------------------------
// 3. NORMALIZED SECTION RENDERER PROPS CONTRACTS
// Themes consume normalized public data from the CMS layer.
// Themes NEVER query database tables or invoke Supabase directly.
// ------------------------------------------------------------------------------

export interface ThemeNavigationProps {
  name: string;
  role: string;
  resumeUrl?: string | null;
  logoUrl?: string | null;
  siteName?: string;
  sections: Section[];
}

export interface ThemeHeroProps {
  content?: HeroContent;
  settings?: SiteSettings | null;
  sectionIndex?: number;
}

export interface ThemeAboutProps {
  content?: AboutContent;
  settings?: SiteSettings | null;
  sectionIndex?: number;
}

export interface ThemeExperienceProps {
  content?: ExperienceContent;
  experienceList: Experience[];
  sectionIndex?: number;
}

export interface ThemeSkillsProps {
  content?: SkillsContent;
  skillsList: Skill[];
  sectionIndex?: number;
}

export interface ThemeProjectsProps {
  content?: ProjectsContent;
  projectsList: Project[];
  sectionIndex?: number;
}

export interface ThemeCertificationsProps {
  content?: CertificationsContent;
  certificationsList: Certification[];
  sectionIndex?: number;
}

export interface ThemeContactProps {
  content?: ContactContent;
  settings?: SiteSettings | null;
  sectionIndex?: number;
}

export interface ThemeFooterProps {
  name: string;
  role: string;
  siteSettings?: SiteSettings | null;
  sections?: Section[];
}

export interface ThemeCustomSectionProps {
  section: Section;
  settings?: SiteSettings | null;
  sectionIndex?: number;
}

// ------------------------------------------------------------------------------
// 4. THEME RENDERERS CONTRACT
// Every registered theme provides implementations for all core section views.
// ------------------------------------------------------------------------------

export interface ThemeRenderers {
  NavigationRenderer: React.ComponentType<ThemeNavigationProps>;
  HeroRenderer: React.ComponentType<ThemeHeroProps>;
  AboutRenderer: React.ComponentType<ThemeAboutProps>;
  ExperienceRenderer: React.ComponentType<ThemeExperienceProps>;
  SkillsRenderer: React.ComponentType<ThemeSkillsProps>;
  ProjectsRenderer: React.ComponentType<ThemeProjectsProps>;
  CertificationsRenderer: React.ComponentType<ThemeCertificationsProps>;
  ContactRenderer: React.ComponentType<ThemeContactProps>;
  FooterRenderer: React.ComponentType<ThemeFooterProps>;
  CustomSectionRenderer?: React.ComponentType<ThemeCustomSectionProps>;
}

// ------------------------------------------------------------------------------
// 5. THEME METADATA & FULL THEME DEFINITION
// ------------------------------------------------------------------------------

export interface ThemePreviewMetadata {
  thumbnailUrl?: string;
  tags?: string[];
  accentColorPreview?: string;
  author?: string;
  aestheticCategory?: 'technical' | 'editorial' | 'minimal' | 'classic';
}

export interface ThemeDefinition {
  id: string; // Stable immutable identifier (e.g. 'modern-developer')
  name: string; // Human-readable name
  description: string;
  version: string; // Semver format (e.g. '1.0.0')
  previewMetadata?: ThemePreviewMetadata;
  tokens: ThemeTokens;
  layout: ThemeLayoutConfig;
  renderers: ThemeRenderers;
}

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
}

// ------------------------------------------------------------------------------
// 6. PUBLIC PORTFOLIO COMPOSITE DATA CONTRACT
// ------------------------------------------------------------------------------

export interface NormalizedPublicPortfolioData {
  siteSettings: SiteSettings | null;
  sections: Section[];
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  certifications: Certification[];
  activeThemeId?: string;
}
