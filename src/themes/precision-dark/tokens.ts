import type { ThemeTokens } from '../types';

/**
 * ==============================================================================
 * THEME 2: PRECISION DARK DESIGN TOKENS
 * 
 * Aesthetic: Modern engineering laboratory / architectural technical documentation.
 * Foundation: Deep graphite base (#08090B), cool slate surfaces (#12151B, #181C22),
 * high-contrast ice white text (#F1F5F9), muted steel secondary copy (#94A3B8),
 * and a restrained technical amber accent (#F59E0B).
 * ==============================================================================
 */

export const precisionDarkTokens: ThemeTokens = {
  colors: {
    // Foundation & Surfaces (Deep graphite & cool slate)
    bgPrimary: '#08090B',
    bgSecondary: '#0E1014',
    surface: '#12151B',
    surfaceElevated: '#181C24',
    surfaceTranslucent: 'rgba(14, 16, 20, 0.90)',

    // Typography (High-contrast cool white, soft steel gray)
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Borders (Precise, fine, architectural hairline rules)
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderDefault: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.20)',
    borderFocus: '#F59E0B',

    // Accents (Restrained technical amber & cool slate)
    accent: '#F59E0B',
    accentHover: '#D97706',
    accentSecondary: '#64748B',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    display: 'font-mono text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F1F5F9] uppercase leading-none',
    h1: 'font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight',
    h2: 'font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5F9] uppercase leading-snug',
    h3: 'font-mono text-base sm:text-lg font-semibold tracking-normal text-[#F1F5F9]',
    h4: 'font-mono text-sm font-medium text-[#F1F5F9]',
    bodyLarge: 'font-sans text-sm sm:text-base text-[#94A3B8] leading-relaxed',
    body: 'font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed',
    bodySmall: 'font-sans text-xs text-[#64748B] leading-normal',
    caption: 'font-mono text-[11px] text-[#64748B] tracking-widest uppercase',
    label: 'font-mono text-[10px] uppercase tracking-widest text-[#F59E0B]',
    navigation: 'font-mono text-[11px] tracking-wider uppercase text-[#94A3B8]',
    button: 'font-mono text-xs uppercase tracking-wider font-semibold',
    metadata: 'font-mono text-xs text-[#64748B] tracking-wider uppercase',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.875rem',
    lg: '1.25rem',
    xl: '1.75rem',
    '2xl': '2.5rem',
    '3xl': '3.5rem',
    '4xl': '5rem',
  },
  shape: {
    radiusSm: '2px',
    radiusMd: '4px',
    radiusLg: '6px',
    radiusXl: '8px',
    radiusFull: '9999px',
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
    shadowGlow: '0 0 20px -2px rgba(245, 158, 11, 0.10)',
  },
  motion: {
    fast: '100ms cubic-bezier(0, 0, 0.2, 1)',
    normal: '180ms cubic-bezier(0, 0, 0.2, 1)',
    slow: '250ms cubic-bezier(0, 0, 0.2, 1)',
    intensity: 'minimal',
  },
};
