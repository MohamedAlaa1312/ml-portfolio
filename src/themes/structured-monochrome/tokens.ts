import type { ThemeTokens } from '../types';

/**
 * ==============================================================================
 * THEME 3: STRUCTURED MONOCHROME DESIGN TOKENS
 * 
 * Aesthetic: Contemporary design portfolio & high-end personal engineering site.
 * Foundation: Pure deep black (#050505), stark monochrome white (#FFFFFF),
 * neutral grays (#A3A3A3, #737373, #171717), and sharp architectural lines.
 * ==============================================================================
 */

export const structuredMonochromeTokens: ThemeTokens = {
  colors: {
    // Foundation & Surfaces (Pure black & structured dark neutrals)
    bgPrimary: '#050505',
    bgSecondary: '#0A0A0A',
    surface: '#121212',
    surfaceElevated: '#171717',
    surfaceTranslucent: 'rgba(5, 5, 5, 0.92)',

    // Typography (Stark contrast: pure white, off-white, neutral grays)
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',

    // Borders (Fine hairline monochrome rules & stark dividing lines)
    borderSubtle: 'rgba(255, 255, 255, 0.10)',
    borderDefault: 'rgba(255, 255, 255, 0.20)',
    borderStrong: 'rgba(255, 255, 255, 0.40)',
    borderFocus: '#FFFFFF',

    // Accents (Monochrome white & subtle neutral silver)
    accent: '#FFFFFF',
    accentHover: '#E5E5E5',
    accentSecondary: '#737373',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    display: 'font-sans text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#FFFFFF] uppercase leading-[0.9]',
    h1: 'font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#FFFFFF] uppercase leading-tight',
    h2: 'font-sans text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#FFFFFF] uppercase leading-snug',
    h3: 'font-sans text-lg sm:text-xl font-bold tracking-tight text-[#FFFFFF] uppercase',
    h4: 'font-mono text-sm font-semibold tracking-wider text-[#FFFFFF] uppercase',
    bodyLarge: 'font-sans text-base sm:text-lg text-[#A3A3A3] leading-relaxed',
    body: 'font-sans text-sm sm:text-base text-[#A3A3A3] leading-relaxed',
    bodySmall: 'font-sans text-xs sm:text-sm text-[#737373] leading-normal',
    caption: 'font-mono text-xs text-[#737373] tracking-widest uppercase',
    label: 'font-mono text-[11px] uppercase tracking-widest text-[#FFFFFF]',
    navigation: 'font-mono text-xs tracking-widest uppercase text-[#A3A3A3]',
    button: 'font-mono text-xs uppercase tracking-widest font-bold',
    metadata: 'font-mono text-xs text-[#737373] tracking-widest uppercase',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4.5rem',
    '4xl': '6.5rem',
  },
  shape: {
    radiusSm: '0px',
    radiusMd: '0px',
    radiusLg: '2px',
    radiusXl: '4px',
    radiusFull: '9999px',
    shadowSm: 'none',
    shadowMd: '0 4px 12px rgba(0, 0, 0, 0.8)',
    shadowLg: '0 8px 24px rgba(0, 0, 0, 0.9)',
    shadowGlow: 'none',
  },
  motion: {
    fast: '100ms ease-out',
    normal: '160ms ease-out',
    slow: '220ms ease-out',
    intensity: 'minimal',
  },
};
