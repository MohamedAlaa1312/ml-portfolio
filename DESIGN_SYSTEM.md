# Machine Learning Engineer Portfolio — Design System Specification
**Version**: 2.0.0 (Phase 2 Visual Foundations)  
**Atmosphere**: Refined Technical Dark Aesthetic (Dark Charcoal, Cold Blue-Gray, Burnt Orange, Antique Gold, Muted Crimson)  
**Strict Directives**: Professional first. NO gaming, fantasy, medieval, battlefield, warrior, bow/arrow, or trailer visual tropes.  

---

## 1. Design Principles

- **Technical Expertise & Engineering Rigor**: Minimalist data-inspired motifs, clean typography hierarchy, mathematical spacing precision, and robust component architecture.
- **Credibility & Personal Identity**: Prominent presentation of the owner's personal portrait, bold name, and clear **Machine Learning Engineer** title without overpowering decorative graphics.
- **Zero Raw Color Scatter**: All colors, radii, shadows, and transitions are centrally declared as CSS custom properties and TypeScript tokens.
- **Shared Architecture**: Public portfolio components and Admin CMS management tools utilize the exact same tokens and primitives.

---

## 2. Atmospheric Color Palette & Tokens

### 2.1 Surfaces & Atmosphere
| Token | Hex / Value | Description |
| :--- | :--- | :--- |
| `--bg-primary` | `#080B11` | Deep obsidian charcoal — primary canvas background |
| `--bg-secondary` | `#0D111A` | Cold dark blue-gray — card containers and panels |
| `--bg-surface` | `#131926` | Elevated surface for interactive components and inputs |
| `--bg-surface-elevated` | `#1A2234` | Highest elevation for hover states, modals, popovers |
| `--bg-translucent` | `rgba(19, 25, 38, 0.75)` | Backdropped surface with `backdrop-filter: blur(12px)` |
| `--bg-cinematic` | `linear-gradient(...)` | Subtle vertical gradient for featured milestone cards |

### 2.2 Accents & Status
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--accent-primary` | `#D97706` | Burnt Orange — Primary brand highlight and focus accents |
| `--accent-secondary` | `#F59E0B` | Antique Gold — Primary interactive CTAs, badges, and glows |
| `--accent-crimson` | `#DC2626` | Muted Crimson — Destructive actions, system alerts, deprecation |
| `--color-success` | `#10B981` | Emerald Green — Production-ready models, online services |
| `--color-warning` | `#F59E0B` | Warning and draft status |
| `--color-error` | `#EF4444` | Form validation errors, failed inference jobs |

### 2.3 Text Hierarchy
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#F8FAFC` | Main headings, title typography, primary contrast text |
| `--text-secondary` | `#94A3B8` | Body paragraphs, descriptions, section subtitles |
| `--text-muted` | `#64748B` | Metadata, timestamps, footnote references, tag text |
| `--text-inverse` | `#080B11` | Text on primary gold/orange CTA buttons |

---

## 3. Typography System

The typography scale uses high-legibility system sans-serif for content and tabular monospace for technical metrics, dates, and code:

| Level | CSS Class / Token | Weight & Specs | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Display** | `text-4xl md:text-6xl` | Extra Bold, `-0.025em` tracking | Hero personal name & primary headline |
| **H1** | `text-3xl md:text-5xl` | Bold, `-0.02em` tracking | Page headers, prominent showcases |
| **H2** | `text-2xl md:text-4xl` | Bold, `-0.015em` tracking | Section titles (`SectionHeading`) |
| **H3** | `text-xl md:text-2xl` | Semibold | Card titles, project names |
| **H4** | `text-lg md:text-xl` | Semibold | Timeline roles, modal titles |
| **Body Large** | `text-base md:text-lg` | Normal, `leading-relaxed` | Hero bio intro, lead paragraphs |
| **Body** | `text-sm md:text-base` | Normal, `leading-relaxed` | General card & project descriptions |
| **Body Small** | `text-xs md:text-sm` | Normal, `leading-normal` | Responsibilities, achievement bullets |
| **Caption** | `text-xs` | Medium | Field notes, table headers |
| **Label** | `text-xs font-mono` | Semibold, `tracking-wider`, uppercase | Section badges, category indicators |
| **Navigation** | `text-sm font-medium` | Medium | Navbar links, footer navigation |
| **Button** | `text-sm font-semibold` | Semibold, `tracking-wide` | Button labels, interactive triggers |
| **Metadata** | `text-xs font-mono` | Regular | Timestamps, Git hashes, model accuracy |

---

## 4. Personal Identity Foundation (`IdentityFrame`)

Specifically created to anchor the future Hero section:
- **Large Profile Portrait**: Framed in a prominent rounded container (`w-44 h-44` on mobile, `w-60 h-60` on desktop) with a subtle ambient gold/orange glow.
- **Prominent Name**: Display typography (`3xl` to `6xl`) guaranteeing instantaneous identification.
- **Professional Title**: Cleanly stamped as **Machine Learning Engineer** with an active status dot badge.
- **Action Slots**: Structured CTA button cluster ("View My Projects", "Get In Touch") and social links (LinkedIn, GitHub, Email).
- **Responsive Guarantee**: Scales seamlessly without truncation on mobile devices.

---

## 5. Spacing & Layout Architecture

- **Scale**: `xs (4px)`, `sm (8px)`, `md (16px)`, `lg (24px)`, `xl (32px)`, `2xl (48px)`, `3xl (64px)`, `4xl (96px)`.
- **Containers**: Max-width `7xl` (`80rem` / `1280px`) with responsive padding: `px-6` (mobile/tablet), `px-12` (desktop).
- **Section Spacing**: `py-16 md:py-24` between major portfolio sections.
- **Grid Gaps**: Standardized `gap-4 sm:gap-6 lg:gap-8` for responsive project/skills grids.

---

## 6. Component Primitives Reference

### 6.1 `Button` (`src/components/ui/Button.tsx`)
- **Variants**:
  - `primary`: Antique gold `#F59E0B` with dark `#080B11` text.
  - `secondary`: Dark slate surface `#1A2234` with subtle border.
  - `ghost`: Transparent with hover highlight.
  - `outline`: Amber outline `#F59E0B/30` with hover tint.
  - `destructive`: Muted crimson `#DC2626` for dangerous admin operations.
- **Sizes**: `sm` (36px min-h), `md` (44px min-h), `lg` (50px min-h).
- **Accessibility**: Guarantees a minimum 44x44px touch target on mobile (`min-h-[44px]` on `md` and `lg`). Integrated loading spinner and SVG icon slots.

### 6.2 `Card` (`src/components/ui/Card.tsx`)
- **Variants**:
  - `standard`: Baseline slate container `#0D111A` with subtle border.
  - `elevated`: High elevation `#131926` with deep shadow.
  - `cinematic`: Refined vertical gradient `#161E31` to `#0D111A` with backdrop blur.
  - `translucent`: Frosted glass `#0D111A/70` with `backdrop-filter: blur(12px)`.
  - `interactive`: Smooth hover elevation `hover:-translate-y-1` and amber border glow.
- **Structure**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

### 6.3 `Badge` & `Tag` (`src/components/ui/Badge.tsx`, `Tag.tsx`)
- **Badge**: Status indicators with optional pulsing indicator dot (`default`, `accent`, `gold`, `crimson`, `success`, `outline`).
- **Tag**: Monospace technology stack pills with optional interactive toggle behavior.

### 6.4 `MediaFrame` (`src/components/ui/MediaFrame.tsx`)
- **Aspect Ratios**: `1/1` (avatars, certs), `16/9` (projects, demos), `4/3` (diagrams), `21/9` (banners), `auto`.
- **Lifecycle**: Integrated skeleton placeholder during asset load and fallback iconography on missing or broken media.

### 6.5 Form System (`Input.tsx`, `Textarea.tsx`, `Select.tsx`)
- High-contrast inputs `#131926` with visible focus rings (`focus-ring`), helper text, required markers, and error messaging.

### 6.6 Feedback & Dialogs (`Modal.tsx`, `LoadingState.tsx`, `EmptyState.tsx`)
- **Modal**: Accessible modal dialog with backdrop blur, Escape key listener, and focus isolation.
- **LoadingState**: Pulse skeletons (`SkeletonText`, `SkeletonCard`) and technical dual-ring spinner (`LoadingSpinner`).
- **EmptyState**: Clean placeholder with icon, heading, guidance message, and optional CTA button.

### 6.7 `ExperienceItem` (`src/components/ui/ExperienceItem.tsx`)
- Professional timeline foundation featuring company logo/monogram slot, role, employment type, location, date range, description, responsibility bullets, achievement checks, and tech stack pills.

---

## 7. Motion, Responsiveness & Accessibility

### 7.1 Motion Tokens
- Fast: `150ms ease-out` (button clicks, badge toggles)
- Normal: `250ms ease-out` (card hovers, dropdown menus, modal reveals)
- Slow: `400ms ease-out` (accordion reveals, surface transitions)
- **Reduced Motion**: Automatically disables transitions and animations when `prefers-reduced-motion: reduce` is detected by the operating system.

### 7.2 Accessibility Standards
- **Keyboard Navigation**: Universal `.focus-ring` utility provides an unmistakable 2px amber focus outline with 2px offset on keyboard tab navigation.
- **Color Contrast**: All text pairings meet or exceed WCAG 2.1 AA/AAA contrast ratios against their respective dark surface tokens.
- **Semantic HTML**: Fully adheres to `<button>`, `<a>`, `<input>`, `<dialog role="dialog">`, and `<header>/<main>/<section>` semantic conventions.

---

## 8. Interactive Verification Route
To inspect and test all Phase 2 primitives interactively:
- **Route**: [`/design-system`](http://localhost:3000/design-system)
