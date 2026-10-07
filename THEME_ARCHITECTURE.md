# Phase 18: Multi-Theme Architecture Specification

This document specifies the multi-theme architecture, presentation contracts, theme registry, active theme resolution lifecycle, and component isolation model for the **Machine Learning Engineer Portfolio (Phase 18)**.

---

## 1. Core Architectural Principle

The portfolio architecture strictly separates three independent concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        CONTENT (CMS)                        │
│  Hero, About, Experience, Skills, Projects, Certifications, │
│  Contact, Social Links, Media, Site Settings                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYOUT STRUCTURE (Sections)                │
│  Sequence, display_order, enabled/disabled, slugs, anchors  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION (Active Theme)                 │
│  Design Tokens, Card Styling, Navigation Variant, Typography │
│  Hierarchies, Borders, Glassmorphism, Micro-Interactions    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       PUBLIC PORTFOLIO                      │
│             Rendered dynamically at route '/'               │
└─────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Theme Changes Affect Presentation, Never Content.**
> Switching or updating visual themes never requires duplicating project descriptions, rewriting career milestones, modifying media assets, or migrating content databases.

---

## 2. Theme Contract (`src/themes/types.ts`)

Every theme implements the stable `ThemeDefinition` TypeScript contract:

```typescript
export interface ThemeDefinition {
  id: string;                      // Immutable identifier (e.g. 'modern-developer')
  name: string;                    // Human-readable theme title
  description: string;             // Architectural aesthetic description
  version: string;                 // Semver string (e.g. '1.0.0')
  previewMetadata?: ThemePreviewMetadata;
  tokens: ThemeTokens;             // Curated design tokens
  layout: ThemeLayoutConfig;       // Layout constraints & navigation position
  renderers: ThemeRenderers;       // Pure presentation component adapters
}
```

### Theme Renderers Contract
Every registered theme provides renderers for all 7 portfolio sections plus navigation and footer:
* `NavigationRenderer: React.ComponentType<ThemeNavigationProps>`
* `HeroRenderer: React.ComponentType<ThemeHeroProps>`
* `AboutRenderer: React.ComponentType<ThemeAboutProps>`
* `ExperienceRenderer: React.ComponentType<ThemeExperienceProps>`
* `SkillsRenderer: React.ComponentType<ThemeSkillsProps>`
* `ProjectsRenderer: React.ComponentType<ThemeProjectsProps>`
* `CertificationsRenderer: React.ComponentType<ThemeCertificationsProps>`
* `ContactRenderer: React.ComponentType<ThemeContactProps>`
* `FooterRenderer: React.ComponentType<ThemeFooterProps>`
* `CustomSectionRenderer?: React.ComponentType<ThemeCustomSectionProps>`

---

## 3. Normalized Public Data Flow

Themes consume normalized public data passed down from the CMS loader. Themes **never** execute database queries, import Supabase clients, or bypass Row Level Security:

```
[PostgreSQL Database / Fallback Store]
                 │
                 ▼
[CmsService (Published & Enabled Filters)]
                 │
                 ▼
[Normalized Public Data (Props)]
                 │
                 ▼
[ThemedSectionRenderer] ──► [Theme Renderer Component]
```

### Invariants:
1. Themes receive immutable data props (`settings`, `projects`, `experience`, `skills`, `certifications`, `sections`).
2. Themes cannot override `status = 'published'` or `enabled = true` visibility rules.
3. Media assets are referenced by canonical URLs; no assets are duplicated per theme.

---

## 4. Theme Registry (`src/themes/registry.ts`)

The `ThemeRegistry` is a centralized, in-memory registry managing all available themes:

* `register(theme: ThemeDefinition): void`: Registers a new theme.
* `get(id: string): ThemeDefinition | undefined`: Retrieves a theme by ID (supports `'default'` alias).
* `getAll(): ThemeDefinition[]`: Returns all available themes.
* `getDefault(): ThemeDefinition`: Returns the designated baseline theme (`'modern-developer'`).
* `resolve(id?: string | null): ThemeDefinition`: Resolves requested ID with guaranteed fallback.
* `isValidThemeId(id: string): boolean`: Validates whether an identifier exists.

### Baseline Registered Theme: Modern Developer
* **ID**: `'modern-developer'` (aliased to `'default'`)
* **Name**: `Modern Developer`
* **Version**: `1.0.0`
* **Aesthetic**: Technical dark theme designed for Machine Learning Engineers, featuring curated amber accents, glassmorphic dark surfaces, and responsive technical typography.
* **Component Implementation**: Adapts the verified Phase 2-17 component pipeline ([`Navbar`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/Navbar.tsx), [`HeroSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/HeroSection.tsx), [`AboutSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/AboutSection.tsx), [`ExperienceSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/ExperienceSection.tsx), [`SkillsSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/SkillsSection.tsx), [`ProjectsSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/ProjectsSection.tsx), [`CertificationsSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/CertificationsSection.tsx), [`ContactSection`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/ContactSection.tsx), [`Footer`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/sections/Footer.tsx)).

---

## 5. Active Theme Resolution & Fallback Behavior

Authoritative theme resolution is coordinated server-side by `ThemeService.getActiveTheme()`:

1. **Preview Override**: If invoked in an authorized preview context with a valid `previewThemeId`, the requested preview theme is rendered.
2. **Authoritative Setting**: Otherwise, reads `site_settings.active_theme` from PostgreSQL / CMS.
3. **Safe Fallback**: If the configured theme ID is missing, empty, or not found in `ThemeRegistry`, the server safely logs a warning and falls back to `'modern-developer'`. The database is **never** corrupted or silently overwritten.
4. **Zero Layout Flash**: Theme resolution occurs on the server before HTML rendering, avoiding client-side theme flickers.

---

## 6. Token Architecture (`src/themes/types.ts` & `src/design-system/tokens.ts`)

Theme tokens extend and structure the Phase 2 design system tokens:

* **Colors**: `bgPrimary`, `bgSecondary`, `surface`, `surfaceElevated`, `surfaceTranslucent`, `textPrimary`, `textSecondary`, `textMuted`, `borderSubtle`, `borderDefault`, `borderStrong`, `borderFocus`, `accent`, `accentHover`, `accentSecondary`, `success`, `warning`, `error`.
* **Typography**: `display`, `h1`, `h2`, `h3`, `h4`, `bodyLarge`, `body`, `bodySmall`, `caption`, `label`, `navigation`, `button`, `metadata`.
* **Spacing**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`.
* **Shape**: `radiusSm`, `radiusMd`, `radiusLg`, `radiusXl`, `radiusFull`, `shadowSm`, `shadowMd`, `shadowLg`, `shadowGlow`.
* **Motion**: `fast`, `normal`, `slow`, `intensity`.

---

## 7. Section Anchors, Accessibility & SEO Invariants

1. **Section Anchors**: All themes must preserve stable public navigation anchor IDs:
   - `#about`
   - `#experience`
   - `#skills`
   - `#projects`
   - `#certifications`
   - `#contact`
2. **Accessibility**: All themes must maintain WCAG AA color contrast, visible focus rings, ARIA labels, semantic HTML landmarks (`<nav>`, `<main>`, `<section>`, `<footer>`), and screen-reader accessibility.
3. **SEO**: Theme switching does not alter page `<title>`, `<meta description>`, Open Graph cards, or canonical URLs generated by `generateMetadata()`.

---

## 8. Publishing Compatibility & Admin Management (Phase 22 & Phase 23)

Theme activation is fully integrated into the Draft/Preview/Publish lifecycle:
* **Current Published Theme**: Authoritative in `site_settings.active_theme`, rendered for all public visitors at `/`.
* **Draft Theme Staging**: Themes can be staged as an unpublished draft (`entity_type: 'theme'`) in `cms_drafts`, verified in `/admin/preview`, and published atomically to the live site.
* **Admin Control Plane**: Managed via [`/admin/themes`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/admin/themes/page.tsx) and [`/api/admin/themes`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/api/admin/themes/route.ts).
* **Guaranteed Content Preservation**: Theme switching strictly alters presentation tokens and renderers; all content, media references, section ordering, and section visibility remain 100% untouched.
* **Detailed Specification**: See [`THEME_PUBLISHING.md`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/THEME_PUBLISHING.md) for the complete state lifecycle, public isolation rules, and cache invalidation policies.

---

## 9. Future Extension Model & Quality Gate (Phase 21 Future Theme Foundation)

Adding future themes (`Theme 4+`) requires only 4 implementation steps:
1. Create a theme definition folder: `src/themes/<theme-id>/`.
2. Define tokens adhering to `ThemeTokens`.
3. Implement the 9 required section renderers (`Navigation`, `Hero`, `About`, `Experience`, `Skills`, `Projects`, `Certifications`, `Contact`, `Footer`).
4. Register the theme in [`ThemeRegistry.register(theme)`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/themes/registry.ts).

### Contract Validation & Safe Fallback Proxying
- [`ThemeRegistry.validate(theme)`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/themes/registry.ts) verifies that any candidate theme provides valid tokens, layout metadata, and all 9 required section renderers before registration.
- If a future theme omits an optional or newly introduced section renderer, [`ThemeRegistry.resolve(id)`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/themes/registry.ts) automatically proxies the default baseline renderer, ensuring the public portfolio never crashes or renders blank sections.

