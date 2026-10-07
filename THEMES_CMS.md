# Phase 22: Admin Themes Management CMS Specification

This document details the architecture, workflows, security model, and API contracts for the **Admin Themes CMS (`/admin/themes`)** implemented in **Phase 22**.

---

## 1. Overview & Goal

The Admin Themes CMS empowers authorized administrators to inspect, stage, preview, and activate visual presentation themes for the public Machine Learning Engineer portfolio.

Key architectural boundaries:
- **Presentation Only**: Theme switching modifies *only* styling, layout structures, and visual composition. It does *not* modify portfolio content, biography, career timeline, projects, skills, certifications, or media assets.
- **Draft/Preview/Publish Lifecycle**: Selecting a theme does not immediately modify the production site. The selection is staged as an unpublished draft, previewable in `/admin/preview`, and activated live only upon explicit confirmation.
- **Single Source of Truth**: 
  - **Code Registry (`ThemeRegistry`)**: Authoritative source for static theme definitions, versioning, metadata, tokens, and renderers.
  - **Database (`site_settings.active_theme`)**: Authoritative source for the currently published production theme.
  - **Staged Drafts (`cms_drafts`)**: Authoritative source for pending theme changes (`entity_type: 'theme'`).

---

## 2. Admin Route & Sidebar Integration

- **Route**: [`/admin/themes`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/admin/themes/page.tsx)
- **Layout**: Uses the shared [`AdminLayout`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/admin/AdminLayout.tsx).
- **Sidebar**: The navigation bar includes:
  - Dashboard
  - Profile & Hero
  - About
  - Experience
  - Skills
  - Projects
  - Certifications
  - Contact
  - Sections
  - Publishing
  - Media
  - Settings
  - **Themes** (`🎨 /admin/themes`)

---

## 3. Security & Access Control

1. **Server-Side Authorization**:
   - Every request to `/admin/themes` and all `/api/admin/themes/*` mutation endpoints enforces [`AuthServerService.isAdmin()`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/auth.server.ts).
   - Unauthenticated users are redirected to `/admin/login?error=unauthorized` or receive HTTP `403 Forbidden`.
   - Authenticated non-admin users cannot read or modify theme drafts or active theme configurations.
2. **Public Mutation Defense**:
   - The public application (`/`) possesses read-only access to the resolved active theme.
   - Public clients cannot mutate `site_settings.active_theme` or stage theme drafts.

---

## 4. Available Registered Themes

The CMS dynamically queries [`ThemeRegistry.getAll()`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/themes/registry.ts) and validates each theme against the Theme Contract. The following themes are supported:

| Theme ID | Name | Aesthetic Category | Accent Preview | Description |
| :--- | :--- | :--- | :--- | :--- |
| `modern-editorial` | Modern Technical Editorial | Editorial | Copper (`#C25E34`) | High-density technical publication layout with warm paper tones, serif display typography, and structured footnotes. |
| `precision-dark` | Precision Dark Portfolio | Technical | Amber (`#F59E0B`) | Architecture and telemetry theme with deep graphite foundations, high-contrast monospace coordinates, and system status markers. |
| `structured-monochrome` | Structured Monochrome | Minimal | White (`#FFFFFF`) | Bold architectural monochrome portfolio theme focused on typography, structure, precision, and technical case studies. |
| `modern-developer` | Modern Developer (Baseline) | Technical | Amber (`#F59E0B`) | Clean modern engineering portfolio with subtle glows and responsive components. |

---

## 5. Theme State Model

Each registered theme displays one of four mutually exclusive states:

1. **`active` (Current Public Theme)**:
   - Exactly one theme holds this state.
   - Active on the public live portfolio at `/`.
   - Marked with an emerald `ACTIVE` badge.
   - Cannot be selected or activated again while active.
2. **`draft` (Staged Draft Theme)**:
   - Staged in `cms_drafts` with `entity_type: 'theme'`.
   - Rendered in Admin Preview at `/admin/preview`.
   - Hidden from public visitors.
   - Marked with an amber `STAGED DRAFT` badge.
3. **`available`**:
   - Valid registered theme eligible for selection.
   - Marked with an `AVAILABLE` badge.
   - Can be previewed or selected as a draft.
4. **`unavailable`**:
   - Registered theme that fails contract validation (e.g. missing required renderers or malformed tokens).
   - Marked with a rose `UNAVAILABLE` badge.
   - Activation and selection are strictly disabled with descriptive validation errors displayed.

---

## 6. Draft, Preview, Publish, Discard Workflow

```text
┌─────────────────┐       Save Draft       ┌─────────────────┐
│ Select Theme    │ ────────────────────▶ │ Staged in Draft │
│ from Catalog    │                       │ (cms_drafts)    │
└─────────────────┘                       └────────┬────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         ▼                                                   ▼
                ┌─────────────────┐                                 ┌─────────────────┐
                │ Admin Preview   │                                 │ Discard Draft   │
                │ (/admin/preview)│                                 │ (Deletes Draft) │
                └────────┬────────┘                                 └─────────────────┘
                         │
                         ▼ Confirm Publish
                ┌───────────────────────────────────┐
                │ Publish Theme                     │
                │ - Updates site_settings           │
                │ - Discards cms_drafts record      │
                │ - Activates live on public site   │
                └───────────────────────────────────┘
```

### 1. Select & Save Draft
- Administrator clicks **"Select Theme"** on any available theme card.
- A request is dispatched to `POST /api/admin/themes` with `{ action: 'save_draft', themeId }`.
- A draft record is created/upserted in `cms_drafts`:
  - `entity_type: 'theme'`
  - `entity_id: 'active_theme'`
  - `title: 'Theme: <Theme Name>'`
  - `data: { active_theme: '<themeId>' }`
- The public site continues serving the current published theme.

### 2. Preview Draft
- Administrator clicks **"Preview Draft ↗"**.
- Opens `/admin/preview` (or `/admin/preview?theme=<themeId>`).
- [`PreviewService.getPreviewData()`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/preview.service.ts) overlays the draft theme onto the site settings.
- The [`PreviewBanner`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/preview/PreviewBanner.tsx) displays: `Preview Mode — Unpublished Theme`.

### 3. Publish Theme
- Administrator clicks **"Publish Theme"**.
- A confirmation modal appears explaining that this action modifies presentation only and preserves all CMS content.
- Upon confirmation, a request is dispatched to `POST /api/admin/themes` with `{ action: 'publish', themeId }`.
- System validates that the theme exists in `ThemeRegistry` and passes contract validation.
- Updates `site_settings.active_theme = themeId`.
- Discards the draft record from `cms_drafts`.
- Public portfolio now serves the newly published theme.

### 4. Discard Theme
- Administrator clicks **"Discard Draft"**.
- A confirmation modal prevents accidental cancellation.
- Upon confirmation, dispatches `POST /api/admin/themes` with `{ action: 'discard' }`.
- Deletes the draft record from `cms_drafts`.
- Both preview and public modes reflect the current published theme.

---

## 7. API Reference

### `GET /api/admin/themes`
- **Guarded**: Yes (`isAdmin`)
- **Response**:
```json
{
  "success": true,
  "activeTheme": {
    "id": "structured-monochrome",
    "name": "Structured Monochrome",
    "description": "...",
    "version": "1.0.0"
  },
  "draftTheme": {
    "id": "draft-theme-active_theme",
    "themeId": "precision-dark",
    "title": "Theme: Precision Dark Portfolio",
    "updatedAt": "2026-10-06T15:00:00.000Z"
  },
  "availableThemes": [
    {
      "id": "modern-editorial",
      "name": "Modern Technical Editorial",
      "version": "1.0.0",
      "isValid": true,
      "validationErrors": [],
      "isAvailable": true,
      "isActive": false,
      "isDraft": false,
      "state": "available"
    }
  ]
}
```

### `POST /api/admin/themes`
- **Guarded**: Yes (`isAdmin`)
- **Actions**:
  - `{ "action": "save_draft", "themeId": "structured-monochrome" }`
  - `{ "action": "publish", "themeId": "structured-monochrome" }`
  - `{ "action": "discard" }`

### Convenience Sub-Endpoints
- `POST /api/admin/themes/draft`: `{ "themeId": "..." }`
- `DELETE /api/admin/themes/draft`: Discards active theme draft
- `POST /api/admin/themes/publish`: `{ "themeId": "..." }` (or publishes current staged draft)
- `POST /api/admin/themes/discard`: Discards current staged draft

---

## 8. Dashboard Integration

The Admin Dashboard ([`/admin/dashboard`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/admin/dashboard/page.tsx)) features an infrastructure status card displaying:
- **Presentation Theme**: Active public theme name (e.g. `Structured Monochrome`).
- **Draft Status**: `Draft: Precision Dark Portfolio` if an unpublished draft is staged, or `Active Public` when in sync.
- Direct link to `/admin/themes`.

---

## 9. Known Limitations

- Real-time multi-admin visual collaboration (e.g. two admins editing simultaneously) is not implemented; theme updates follow standard optimistic locking.
- Theme CSS stylesheets are modularized through Tailwind and tokens; runtime client-side CSS injection from external arbitrary URLs is intentionally disallowed for security.
