# THEME 1: MODERN TECHNICAL EDITORIAL (`modern-editorial`)

## 1. Theme Identity & Metadata

- **Theme ID**: `modern-editorial`
- **Name**: `Modern Technical Editorial`
- **Version**: `1.0.0`
- **Category**: `editorial` / `technical`
- **Description**: A professional editorial-style portfolio theme designed for technical and machine learning engineering portfolios, synthesizing the aesthetics of a high-end engineering journal, technical specification dossier, and modern digital publication.
- **Preview Metadata**:
  - `accentColorPreview`: `#C25E34` (Burnt copper / terracotta)
  - `tags`: `['Editorial', 'Machine Learning', 'Technical Typography', 'Minimalism', 'Precision']`
  - `author`: `Portfolio Core Architecture`

---

## 2. Visual Direction & Aesthetic Philosophy

Modern Technical Editorial prioritizes typographic precision, structured asymmetrical grids, restrained contrast, and generous whitespace. It communicates deep technical competence, engineering rigor, and scientific credibility without resorting to gaming HUDs, sci-fi cyber graphics, or generic SaaS landing page tropes.

### Core Visual Principles
- **Deep Charcoal Foundation**: Near-black matte charcoal base (`#0C0D0E`) avoiding aggressive pitch blacks or blue casts.
- **Editorial Typography**: High-contrast typographic pairing of confident sans display headlines (`#EDEDEC`) with precise monospace indexing markers (`01.`, `INDEX // 00`, `FIG 01. PORTRAIT`).
- **Restrained Copper Accents**: Subtle burnt copper / terracotta accents (`#C25E34`, `#D97746`) used selectively for index markers, corner registration marks, and active states.
- **Fine Technical Borders**: Crisp hairline rules (`border-white/[0.08]`) establishing clean grid rhythm across sections.
- **Authentic Identity & Large Portrait**: A prominent, sharp, framed portrait photograph occupying a dominant visual position, framed with architectural corner brackets and technical captions.

---

## 3. Theme Tokens

All design tokens are formalized in `src/themes/modern-editorial/tokens.ts` implementing `ThemeTokens`:

### Colors (`ThemeColorTokens`)
| Token | Value | Semantic Role |
|---|---|---|
| `bgPrimary` | `#0C0D0E` | Main page background (deep charcoal) |
| `bgSecondary` | `#121417` | Section secondary panels & cards |
| `surface` | `#17191E` | Card surfaces & media containers |
| `surfaceElevated` | `#1E2128` | Elevated hover layers & drawers |
| `surfaceTranslucent` | `rgba(23, 25, 30, 0.85)` | Sticky header backdrop blur |
| `textPrimary` | `#EDEDEC` | Primary editorial headlines & titles (warm off-white) |
| `textSecondary` | `#A1A1AA` | Body copy & narrative paragraphs (cool gray) |
| `textMuted` | `#71717A` | Index metadata, captions, technical labels (steel gray) |
| `borderSubtle` | `rgba(255, 255, 255, 0.07)` | Internal dividers & card rules |
| `borderDefault` | `rgba(255, 255, 255, 0.12)` | Component borders |
| `borderStrong` | `rgba(255, 255, 255, 0.22)` | Interactive hover borders |
| `borderFocus` | `#C25E34` | Focus rings & active focus indicators |
| `accent` | `#C25E34` | Burnt copper / terracotta editorial accent |
| `accentHover` | `#D97746` | Interactive hover accent state |
| `accentSecondary` | `#8B949E` | Muted steel accent |
| `success` | `#10B981` | Validation & availability status |
| `warning` | `#F59E0B` | Warning feedback |
| `error` | `#EF4444` | Error states |

### Layout (`ThemeLayoutConfig`)
- `containerMaxWidth`: `max-w-7xl`
- `navPosition`: `sticky`
- `sectionPadding`: `py-20 sm:py-24 lg:py-32`
- `gridGap`: `gap-8 sm:gap-12`

---

## 4. Section Implementations

### 4.1 Navigation (`EditorialNavbar.tsx`)
- Minimalist top navigation bar with slim backdrop blur (`#0C0D0E/95`).
- Left brand lockup: Monogram pill (`MK`) or custom CMS logo + engineer name and uppercase role (`MACHINE LEARNING ENGINEER`).
- Center navigation: Section links dynamically resolved from CMS sections with numeric indexing (`01. ABOUT`, `02. EXPERIENCE`, `03. SKILLS`, `04. PROJECTS`, etc.).
- Right action: `RESUME ↓` download link directly linked to CMS resume document.
- Mobile drawer: Accessible hamburger menu (`☰` / `✕`) with smooth drawer overlay, full ARIA attributes, and escape key listener.

### 4.2 Hero Section (`EditorialHero.tsx`)
- Asymmetric 12-column composition:
  - **Left (col-7 on desktop)**:
    - Editorial index bar: `INDEX // 00`, `TECHNICAL DOSSIER`, and real CMS location or system status.
    - Greeting label: `PORTFOLIO // VOLUME 01` (from CMS).
    - Large authoritative name: `Mohamed Khaled` (`h1`).
    - Title: `Machine Learning Engineer`.
    - Editorial narrative bio / summary from CMS.
    - Primary CTA (`EXPLORE PROJECTS →`) and secondary CTA (`GET IN TOUCH`).
    - Dynamic social links with technical dividers (`//`).
  - **Right (col-5 on desktop)**:
    - Prominent, large, sharp profile portrait framed with fine borders and copper corner brackets.
    - Editorial caption: `FIG 01. PORTRAIT // MACHINE LEARNING ENGINEER`.
    - No artificial filters, AI modifications, or circular avatar shrinkage.

### 4.3 About Section (`EditorialAbout.tsx`)
- Section metadata: `01 / ABOUT // DOSSIER // 01`.
- Clean editorial layout:
  - Strong section heading with copper accent line.
  - Long-form narrative biography from CMS.
  - Structured spec cards for core technical pillars (`Problem Solver`, `Continuous Learner`, `Team Player`).
  - Secondary portrait frame with verified archive caption (`IDENTITY // ARCHIVE: VERIFIED`).

### 4.4 Experience Section (`EditorialExperience.tsx`)
- Section metadata: `02 / EXPERIENCE // TRAJECTORY // 02`.
- Structured vertical editorial timeline:
  - Left column: Company name, company logo (fallback to monospace monogram), location, clean date range (`2022 — Present`), and employment type.
  - Right column: Large role title (`h4`), `Current` live status badge, high-level summary, editorial bullet list of responsibilities / achievements (`—`), and technology tags.
  - Zero placeholders: Missing logos or locations render cleanly without broken boxes.

### 4.5 Skills Section (`EditorialSkills.tsx`)
- Section metadata: `03 / CAPABILITIES // CAPABILITIES // 03`.
- Technical capability matrix grouped by CMS categories:
  - Category panels with header indexing (`CAT // 01`), category name, skill count, and optional category description.
  - Skill pills in monospace typography.
  - Percentage proficiencies rendered ONLY if valid positive numeric values exist in CMS data (no fabricated 95% progress bars).

### 4.6 Projects Section (`EditorialProjects.tsx`)
- Section metadata: `04 / PROJECTS // SELECTED WORKS // 04`.
- Editorial project card grid:
  - Image frame with 16:9 ratio loaded from Media Manager references (`thumbnail_url`), maintaining aspect ratio.
  - Indexing: `SYSTEM // 01 PRODUCTION`.
  - Project title, concise description, technology stack tags.
  - Verified external action links: `SOURCE CODE ↗` (GitHub) and `LIVE SYSTEM ↗` (Demo) with `rel="noopener noreferrer"`.
  - Empty link buttons are strictly hidden if URLs are not configured.

### 4.7 Certifications Section (`EditorialCertifications.tsx`)
- Section metadata: `05 / CREDENTIALS // CREDENTIALS // 05`.
- Document-style credential panels:
  - Issuer badge / credential thumbnail frame with fallback monogram.
  - Certification title, issuing authority, issue date, expiration date, and Credential ID.
  - Verification link (`VERIFY CREDENTIAL ↗`) opening authoritative issuer URL.

### 4.8 Contact Section (`EditorialContact.tsx`)
- Section metadata: `06 / CONTACT // INQUIRIES // 06`.
- Direct contact details: Email, phone, location, availability badge (`STATUS: AVAILABLE FOR SELECT OPPORTUNITIES`), and CMS social links.
- Interactive transmission form: Direct inquiry submission simulation with accessible feedback (`Dispatch Acknowledged`).
- Zero fabricated phone numbers or dummy addresses.

### 4.9 Footer (`EditorialFooter.tsx`)
- Technical colophon displaying engineer name, role, quick anchor navigation links, copyright year, and active theme badge: `THEME: MODERN TECHNICAL EDITORIAL v1.0.0`.

---

## 5. Responsive Design

Tested and verified across viewports:
- **Desktop (1280px - 1920px)**: Asymmetric 12-column layout, large portrait frame, horizontal navigation.
- **Tablet (768px - 1024px)**: 2-column project and skills grid, responsive spacing.
- **Mobile (375px - 430px)**:
  - Hero composition stacks cleanly: Title & Name -> Intro narrative -> Large, prominent portrait photo -> Action CTAs -> Social links.
  - The photo remains large and immediately recognizable (NOT shrunk into a tiny avatar).
  - Navigation converts into an accessible drawer with full touch targets (`min-h-[44px]`).

---

## 6. Accessibility & Motion

- **Semantic HTML**: Strict heading hierarchy (`h1` for engineer name in hero, `h2` for sections, `h3` for categories and cards).
- **Keyboard Navigation**: All interactive elements (links, buttons, inputs) feature explicit visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#C25E34]`).
- **Screen Reader Support**: ARIA attributes on mobile navigation (`aria-expanded`, `aria-controls`, `aria-label`) and live region feedback on form submission (`role="status"`, `aria-live="polite"`).
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling non-essential transitions and animations.

---

## 7. Media & CMS Integration

- All images use authoritative references from the Media Manager (`SiteSettings.profile_image`, `Project.thumbnail_url`, `Certification.image_url`, `Experience.company_logo`).
- Zero database duplication: Theme 1 operates strictly as a presentation layer consuming normalized CMS data via the `ThemedSectionRenderer` pipeline.
- Dynamic CMS Section Sequencing: Section ordering and visibility are controlled by the CMS `sections` table; Theme 1 does NOT hardcode section order.

---

## 8. Theme Registry Integration & Safety

- Registered in `src/themes/registry.ts`:
  ```ts
  this.register(modernEditorialTheme);
  ```
- Stable ID: `modern-editorial`.
- Production Safety: The baseline theme remains `modern-developer` by default until explicitly changed in `site_settings.active_theme` or tested via `?theme=modern-editorial` parameter.
- Admin Preview Compatibility: Admin preview (`/admin/preview?theme=modern-editorial`) renders draft and staged content seamlessly through Theme 1 renderers.

---

## 9. Verification & Test Suite

Validated via automated test suites:
- `scripts/test-phase19.mjs`: 50/50 tests passing (Registry, Tokens, Isolation, API, Sections, Hero, Responsive, Preview).
- `scripts/test-phase18.mjs`: 32/32 tests passing (Zero regressions to Multi-Theme architecture).
- Visual browser session: Verified on desktop and mobile viewports via headless Chromium recording (`modern_editorial_demo.webp`).

---

## 10. Known Limitations

- Multi-theme administration UI (`/admin/themes`) is deferred to Phase 21 as per architecture roadmap.
- Theme switching currently operates via `site_settings.active_theme` in database or preview resolution contexts.
