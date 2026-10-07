# Phase 23: Theme Integration & Publishing Specification

This document provides the definitive architectural specification for **Theme Integration & Publishing (Phase 23)** in the Machine Learning Engineer Portfolio. It formalizes how presentation themes participate in the existing **Draft → Preview → Publish** lifecycle.

---

## 1. Core Architectural Principle

The theme system is a first-class citizen of the content management lifecycle, strictly governed by the sequence:

```
Select Theme ──► Save Draft ──► Authorized Preview ──► Publish ──► Public Portfolio Updates
```

### Critical Invariants:
1. **Public Isolation**: Changing or selecting a theme in Admin **NEVER** immediately alters the live public portfolio.
2. **Current Published Theme vs. Draft Theme**: Normal public visitors at `/` strictly receive the published theme configuration. Authorized Preview at `/admin/preview` dynamically overlays the staged draft theme.
3. **Content Independence**: Publishing a visual theme publishes **ONLY** the theme configuration. Any pending staged content drafts (e.g. draft projects, updated bio, section reordering) remain untouched in draft status.
4. **Presentation/Data Separation**: Visual themes govern design tokens and component renderers. All CMS entities, section display order, section enabled states, media assets, and SEO settings remain 100% invariant across theme switches.

---

## 2. Single Source of Truth & Database Entities

The theme lifecycle reuses the established Phase 13 & 15 data layer without adding redundant tables:

| Entity Layer | Physical Store | Field / Key | Description |
|---|---|---|---|
| **Current Published Theme** | `site_settings` table | `active_theme` (string) | Authoritative identifier for the live public site (e.g., `'modern-editorial'`, `'precision-dark'`, `'structured-monochrome'`). |
| **Staged Draft Theme** | `cms_drafts` table | `entity_type: 'theme'`, `entity_id: 'active_theme'` | Contains staged selection payload `{ active_theme: '<theme-id>' }`. |
| **Theme Implementation** | `ThemeRegistry` (in-memory) | Registry singleton | Translates theme identifiers to visual implementations (tokens, layout, renderers). The database specifies **WHICH** theme is active; the Registry defines **HOW** it renders. |

---

## 3. Theme Lifecycle States

At any point in time, the Admin Themes CMS (`/admin/themes`) distinguishes between four distinct states:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. PUBLISHED THEME                                                     │
│    Active on the live public site (site_settings.active_theme).        │
├────────────────────────────────────────────────────────────────────────┤
│ 2. STAGED DRAFT THEME                                                  │
│    Persisted in cms_drafts; visible in /admin/preview; hidden from     │
│    public visitors.                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. UNSAVED THEME SELECTION                                             │
│    User clicked a theme card in the UI but has not yet saved it.       │
│    Prompts the user to "Save as Draft" or "Cancel".                    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. DISCARDED / RESET                                                   │
│    Theme draft purged from cms_drafts. Public site stays on published  │
│    theme.                                                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Workflows & API Endpoints

### 4.1. Save Draft Theme
- **Admin Action**: Clicking "Save as Draft" on an unsaved theme selection.
- **Endpoint**: `POST /api/admin/themes` (`{ action: 'save_draft', themeId: '<id>' }`) or `POST /api/admin/themes/draft`.
- **Server Execution**:
  1. Validates admin session via `AuthServerService.isAdmin()`.
  2. Resolves `<id>` through `ThemeRegistry.get(id)`. Rejects unknown IDs with `400 Bad Request`.
  3. Validates theme against the Theme Contract (`ThemeRegistry.validate()`). Rejects invalid themes with `400 Bad Request`.
  4. Upserts draft record into `cms_drafts` with `entity_type: 'theme'`, `entity_id: 'active_theme'`.
  5. Invalidates preview cache (`revalidatePath('/admin/preview')`, `revalidatePath('/admin/themes')`).
  6. **Live public site remains strictly untouched.**

### 4.2. Authorized Preview
- **Route**: `/admin/preview` (optionally query override `?theme=<id>`).
- **Security**: Guarded server-side by `AuthServerService.isAdmin()`. Unauthenticated requests redirect to `/admin/login?error=unauthorized`.
- **Resolution Order**:
  1. Explicit query parameter `?theme=<id>` (if authorized).
  2. Staged draft theme from `cms_drafts` (`entity_type: 'theme'`).
  3. Published theme from `site_settings.active_theme`.
  4. Safe fallback baseline (`'modern-developer'`).
- **Preview Banner**:
  - Displays `"Preview Mode — Unpublished Theme"` badge when a theme draft is staged.
  - Provides a direct link `[Themes 🎨]` back to `/admin/themes` for seamless exit without URL editing.

### 4.3. Publish Theme
- **Admin Action**: Clicking "Publish Theme" opens a modal confirmation dialog:
  > *"Publish Theme? Are you sure you want to activate [Theme Name] as the live public theme? This action modifies only the public presentation layer. All CMS data will remain 100% intact."*
- **Endpoint**: `POST /api/admin/themes` (`{ action: 'publish', themeId?: '<id>' }`) or `POST /api/admin/themes/publish`.
- **Server Execution**:
  1. Validates admin session server-side (`AuthServerService.isAdmin()`).
  2. Resolves target theme ID (either from payload or from existing staged draft in `cms_drafts`).
  3. Verifies theme existence and contract validity in `ThemeRegistry`.
  4. Atomically updates `site_settings.active_theme = targetThemeId`.
  5. Purges the theme draft (`entity_type: 'theme'`) from `cms_drafts`.
  6. **Leaves all other staged content drafts untouched** (e.g., pending project drafts).
  7. Triggers Next.js cache revalidation:
     - `revalidatePath('/', 'layout')`
     - `revalidatePath('/')`
     - `revalidatePath('/admin/preview')`
     - `revalidatePath('/admin/dashboard')`
     - `revalidatePath('/admin/themes')`
  8. Returns confirmation payload `{ success: true, activeTheme: { id, name, version } }`.

### 4.4. Discard Draft Theme
- **Admin Action**: Clicking "Discard Draft" opens a modal confirmation dialog:
  > *"Discard Draft Theme? Are you sure you want to discard the unpublished theme selection for [Theme Name]? The public portfolio will remain on the currently published theme ([Active Theme])."*
- **Endpoint**: `POST /api/admin/themes` (`{ action: 'discard' }`) or `POST /api/admin/themes/discard` or `DELETE /api/admin/themes/draft`.
- **Server Execution**:
  1. Validates admin session server-side (`AuthServerService.isAdmin()`).
  2. Deletes `entity_type: 'theme'` from `cms_drafts`.
  3. Revalidates admin preview routes.
  4. Public site remains on `site_settings.active_theme`.
  5. The theme source code, CMS content, and media items are **never** deleted.

---

## 5. Public Theme Resolution & Isolation

The public portfolio at route `/` centralizes theme resolution in `ThemeService.getPublishedTheme()` / `ThemeService.getActiveTheme()`:

```
[Public Visitor Request at '/']
               │
               ▼
   [CmsService.getSiteSettings()]
               │  (Reads site_settings.active_theme; ignores cms_drafts)
               ▼
  [ThemeRegistry.resolve(active_theme)]
               │
      ┌────────┴────────┐
   Valid ID          Invalid / Missing
      │                 │
      ▼                 ▼
[Target Theme]   [Safe Fallback: 'modern-developer']
      │                 │
      └────────┬────────┘
               ▼
[Server-Rendered HTML (Zero FOUC)]
```

### Invariants:
1. **Zero Draft Leakage**: Public visitors never receive unpublished theme styles, even during active editing, page refreshes, or across different browsers.
2. **Zero Layout Flash (FOUC)**: Themes are resolved server-side before HTML streaming. The root wrapper emits `data-theme="<id>"` and theme-specific Tailwind classes immediately in SSR.
3. **Safe Fallback**: If `site_settings.active_theme` references an invalid or unregistered identifier:
   - Server logs a diagnostic warning via `console.warn`.
   - Safely renders the baseline fallback theme (`'modern-developer'`).
   - Does **not** throw 500 internal server errors.
   - Does **not** leak database traces or stack traces publicly.
   - Does **not** silently mutate the production database during rendering.

---

## 6. Content & System Independence

Theme publishing strictly isolates the visual presentation layer from all other CMS entities:

| Subsystem | Independence Guarantee |
|---|---|
| **CMS Content** | Hero greeting, bio, experience milestones, skills proficiency, projects descriptions, certifications, and contact details remain unchanged across theme switches. |
| **Draft Content Staging** | If an admin has a staged draft project (e.g. `entity_type: 'project'`) while publishing a theme draft, the project draft remains staged and unpublished. |
| **Section Ordering** | The custom section order defined in `/admin/sections` (e.g., `Hero → Projects → About → Experience → Skills → Certifications → Contact`) is preserved across all themes. |
| **Section Visibility** | Disabled sections (e.g., `enabled: false` on Experience) remain disabled across all themes. Themes never re-enable hidden sections. |
| **Media Assets** | Profile portrait, workstation photos, project thumbnails, and resume documents maintain canonical URLs and usage references. Media is neither duplicated nor deleted. |
| **Site Settings & SEO** | `seo_title`, `seo_description`, Open Graph cards, canonical URLs, favicon, and contact email remain invariant across theme switches. |

---

## 7. Security & Access Control Audit

All theme mutation operations enforce defense-in-depth security:

```
Request ──► [Next.js Route Handler]
                 │
                 ▼
     [AuthServerService.isAdmin()]
                 │
        ┌────────┴────────┐
     Authorized       Unauthorized
        │                 │
        ▼                 ▼
  [ThemeRegistry]     [403 Forbidden]
        │
        ▼
[Supabase RLS / Store]
```

1. **Authentication Boundary**: All endpoints under `/api/admin/themes*` require an active Supabase admin session or verified admin auth cookie.
2. **Non-Admin & Public Rejection**: Unauthenticated or non-admin requests receive immediate `403 Forbidden` responses.
3. **Preview Route Protection**: `/admin/preview` performs server-side checks and redirects unauthorized visitors to `/admin/login`. Query parameters (`?theme=...`) cannot expose draft themes to unauthorized users.
4. **Input Sanitization**: Theme IDs are validated against strict alphanumeric patterns (`/^[a-z0-9-_]+$/`) and checked against the registered theme map.

---

## 8. Summary of Registered Themes

| Theme ID | Display Name | Category | Primary Visual Trait |
|---|---|---|---|
| `modern-developer` | Modern Developer | Baseline / Default | Clean dark mode with amber accents, technical glassmorphism. |
| `modern-editorial` | Modern Technical Editorial | Theme 1 | Warm editorial serif typography (`Cinzel`/`Newsreader`), terracotta accents, refined bookish borders. |
| `precision-dark` | Precision Dark Portfolio | Theme 2 | High-contrast pitch-black (`#08090B`), monospace coordinates, technical HUD telemetry, amber glow indicators. |
| `structured-monochrome` | Structured Monochrome | Theme 3 | Pure stark architectural monochrome (`#050505`), crisp geometric dividers, brutalist high-legibility layout. |

---

## 9. Known Limitations & Non-Goals

1. **Theme History / Rollbacks**: The system maintains the current published theme and at most one staged draft theme. Historical rollback is achieved by selecting a previous theme, saving draft, previewing, and publishing.
2. **Theme Customization Builder**: Custom CSS tweaking or per-token overriding in the Admin UI is out of scope. Themes are declarative code modules in `src/themes/`.
3. **Theme-Specific Content**: Per-theme alternative content versions are prohibited by design. All themes render the single source of truth from CMS content.
