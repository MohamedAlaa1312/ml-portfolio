import type { ThemeTokens } from '../types';

/**
 * ==============================================================================
 * THEME 1: MODERN TECHNICAL EDITORIAL DESIGN TOKENS
 * 
 * Aesthetic: High-end technical journal & modern engineering publication.
 * Foundation: Deep charcoal / near-black foundation with warm off-white typography,
 * cool steel gray secondary accents, and restrained burnt orange / copper accents.
 * ==============================================================================
 */

export const modernEditorialTokens: ThemeTokens = {
  colors: {
    // Foundation & Surfaces (Deep charcoal / near-black)
    bgPrimary: '#0C0D0E',
    bgSecondary: '#121417',
    surface: '#17191E',
    surfaceElevated: '#1E2128',
    surfaceTranslucent: 'rgba(23, 25, 30, 0.85)',

    // Typography (Warm off-white and cool/muted grays)
    textPrimary: '#EDEDEC',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Borders (Crisp, thin, restrained)
    borderSubtle: 'rgba(255, 255, 255, 0.07)',
    borderDefault: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.22)',
    borderFocus: '#C25E34',

    // Accents (Restrained burnt orange / copper)
    accent: '#C25E34',
    accentHover: '#D97746',
    accentSecondary: '#8B949E',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    display: 'font-sans text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#EDEDEC] leading-[1.08]',
    h1: 'font-sans text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#EDEDEC] leading-tight',
    h2: 'font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEDEC] leading-snug',
    h3: 'font-sans text-lg sm:text-xl font-semibold tracking-normal text-[#EDEDEC]',
    h4: 'font-sans text-base font-medium text-[#EDEDEC]',
    bodyLarge: 'font-sans text-base sm:text-lg text-[#A1A1AA] leading-relaxed',
    body: 'font-sans text-sm sm:text-base text-[#A1A1AA] leading-relaxed',
    bodySmall: 'font-sans text-xs sm:text-sm text-[#71717A] leading-normal',
    caption: 'font-mono text-xs text-[#71717A] tracking-wider uppercase',
    label: 'font-mono text-[11px] uppercase tracking-widest text-[#C25E34]',
    navigation: 'font-mono text-xs tracking-wider uppercase text-[#A1A1AA]',
    button: 'font-mono text-xs uppercase tracking-wider font-semibold',
    metadata: 'font-mono text-xs text-[#71717A] tracking-wider uppercase',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  shape: {
    radiusSm: '4px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusXl: '16px',
    radiusFull: '9999px',
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
    shadowGlow: '0 0 24px -2px rgba(194, 94, 52, 0.12)',
  },
  motion: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
    intensity: 'minimal',
  },
};
