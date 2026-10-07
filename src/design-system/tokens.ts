/**
 * ==============================================================================
 * CENTRALIZED DESIGN TOKENS
 * Professional Machine Learning Engineer Portfolio
 * ==============================================================================
 */

export const tokens = {
  colors: {
    bg: {
      primary: '#080B11',
      secondary: '#0D111A',
      surface: '#131926',
      surfaceElevated: '#1A2234',
      translucent: 'rgba(19, 25, 38, 0.75)',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.05)',
      default: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.2)',
      focus: '#F59E0B',
      accent: 'rgba(217, 119, 6, 0.4)',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
      inverse: '#080B11',
    },
    accents: {
      burntOrange: '#D97706',
      burntOrangeHover: '#B45309',
      antiqueGold: '#F59E0B',
      antiqueGoldHover: '#D97706',
      mutedCrimson: '#DC2626',
      mutedCrimsonHover: '#B91C1C',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    display: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100',
    h1: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100',
    h2: 'text-2xl md:text-3xl font-bold tracking-tight text-slate-100',
    h3: 'text-xl md:text-2xl font-semibold tracking-tight text-slate-200',
    h4: 'text-lg md:text-xl font-semibold text-slate-200',
    bodyLarge: 'text-base md:text-lg text-slate-300 leading-relaxed',
    body: 'text-sm md:text-base text-slate-300 leading-relaxed',
    bodySmall: 'text-xs md:text-sm text-slate-400 leading-relaxed',
    caption: 'text-xs text-slate-500 font-medium',
    label: 'text-xs font-mono font-medium tracking-wider text-slate-400 uppercase',
    navigation: 'text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors',
    button: 'text-sm font-semibold tracking-wide',
    metadata: 'text-xs font-mono text-slate-400',
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },
  radii: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-xl',
    glow: 'shadow-[0_0_25px_-4px_rgba(245,158,11,0.2)]',
    glowCrimson: 'shadow-[0_0_25px_-4px_rgba(220,38,38,0.2)]',
  },
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-250 ease-out',
    slow: 'transition-all duration-400 ease-out',
  },
} as const;
