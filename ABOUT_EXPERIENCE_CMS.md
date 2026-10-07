# About & Experience CMS Specification & Architecture (Phase 7)

## Overview
Phase 7 introduces the administrative Content Management System (CMS) modules for the **About** section and **Professional Experience** timeline. It empowers authorized portfolio owners to manage their narrative biography, core pillars, career history, highlighted achievements, and technologies through dedicated admin interfaces (`/admin/about` and `/admin/experience`) without writing code or modifying database tables manually.

---

## 1. About CMS Architecture

### 1.1 Data Flow
```
Admin About Editor (/admin/about)
  │
  ▼  (POST /api/admin/about)
AdminService.upsertSection(slug: 'about')
  │
  ▼
PostgreSQL `sections` Table (or DevFallbackStore when unconfigured)
  │
  ▼
CmsService.getPublishedSections()  [filters: status='published' AND enabled=true]
  │
  ▼
Public Home Page (/) → SectionRenderer → AboutSection Component
```

### 1.2 Data Structure
The About section is stored in the `public.sections` table with `slug = 'about'` and `type = 'about'`:
- `id` (UUID): Primary key.
- `title` (TEXT): Internal display title (e.g., `"About Me"`).
- `slug` (TEXT): Unique identifier (`"about"`).
- `type` (section_type): `'about'`.
- `content` (JSONB):
  - `badge` (STRING): Section pill badge (e.g., `"About Mohamed Khaled"`).
  - `heading` (STRING): Prominent summary headline (e.g., `"Turning Data Into Intelligent Solutions"`).
  - `description` (STRING): Main narrative bio/body.
  - `pillars` (ARRAY of Objects):
    - `title` (STRING): Pillar title (e.g., `"Problem Solver"`).
    - `description` (STRING): Pillar explanation.
    - `icon` (STRING): Symbol/emoji (e.g., `"⚡"`, `"🧠"`, `"🤝"`).
  - `avatarUrl` (STRING, optional): Secondary portrait or graphic frame.
- `enabled` (BOOLEAN): Master toggle controlling whether the section is visible publicly.
- `status` (publish_status): `'draft' | 'published' | 'archived'`.
- `display_order` (INT): Sequence index in the dynamic section pipeline.

### 1.3 Editorial Rules
- **No Synthetic Biography**: The system does NOT auto-generate or seed fake biographical text. If the section is empty, an intuitive empty state prompts the administrator to provide real content.
- **Unsaved Changes Protection**: Changes trigger an `isDirty` state, displaying a warning badge and hooking into `beforeunload` to prevent accidental navigation.

---

## 2. Experience CMS Architecture

### 2.1 Data Structure
Experience records are stored in the `public.experience` table:
- `id` (UUID): Primary key.
- `company` (TEXT, required): Company or institution name.
- `role` (TEXT, required): Position title.
- `employment_type` (TEXT): E.g., `'Full-time'`, `'Part-time'`, `'Contract'`, `'Internship'`, `'Freelance'`.
- `location` (TEXT): Location of work (e.g., `'Remote'`, `'Cairo, Egypt'`).
- `start_date` (DATE, required): Start date (`YYYY-MM-DD`).
- `end_date` (DATE, nullable): End date, or `null` if currently active.
- `is_current` / `current_position` (BOOLEAN): Synchronized flag indicating an ongoing role.
- `description` (TEXT): High-level summary of responsibilities and team context.
- `responsibilities` (TEXT[]): Bulleted list of day-to-day duties.
- `achievements` (TEXT[]): Highlighted metrics and outcomes (rendered with green checkmarks).
- `technologies` (TEXT[]): Array of tools, frameworks, and programming languages.
- `company_logo` / `company_logo_url` (TEXT, nullable): Path or URL to company logo media.
- `display_order` (INT): Manual sequence order for the public timeline.
- `enabled` (BOOLEAN): Visibility toggle (`true` = active, `false` = hidden).
- `status` (publish_status): `'draft' | 'published' | 'archived'`.
- `created_at` (TIMESTAMPTZ): Creation timestamp.
- `updated_at` (TIMESTAMPTZ): Auto-updated via trigger.

### 2.2 CRUD Operations
- **Create**: Submits to `POST /api/admin/experience` with validation for mandatory company, role, and start date.
- **Read**: Admin list at `GET /api/admin/experience` returns all entries ordered by `display_order ASC`.
- **Update**: Submits to `PUT /api/admin/experience/[id]` updating fields without full page reload.
- **Delete / Archive**:
  - `DELETE /api/admin/experience/[id]` removes the record after explicit user confirmation dialog.
  - Non-destructive archival is supported by toggling `status: 'archived'` or `enabled: false`.

### 2.3 Reordering
- Experience entries support manual display ordering via accessible **Move Up (▲)** and **Move Down (▼)** controls.
- Reordering calls `POST /api/admin/experience/reorder` with an array of ordered IDs, updating `display_order` sequentially.

---

## 3. Company Media & Logo Integration
- Media uploads leverage the existing `/api/admin/upload` endpoint:
  - Supported formats: JPEG, PNG, WEBP, SVG.
  - File size cap: 2MB for logos, 5MB for portraits.
  - Multi-tier storage: Saves to Supabase Storage bucket `portfolio-images` when configured, or local fallback `public/uploads/` during local development.
- In the public UI, `ExperienceItem` displays:
  - Custom company logo image if uploaded.
  - Fallback stylized company monogram with brand accent colors if no logo is provided.

---

## 4. Public Visibility & Filtering Rules

| Status | Enabled State | Public Visibility | Admin Visibility |
| :--- | :--- | :--- | :--- |
| `published` | `true` | **Visible** | Visible |
| `published` | `false` | **Hidden** | Visible (marked Disabled) |
| `draft` | `true` / `false` | **Hidden** | Visible (marked Draft) |
| `archived` | `true` / `false` | **Hidden** | Visible (marked Archived) |

Public queries via `CmsService.getPublishedExperience()` strictly enforce:
```sql
SELECT * FROM public.experience
WHERE status = 'published' AND enabled = true
ORDER BY display_order ASC;
```

---

## 5. Security & Authorization
- **Defense in Depth**:
  - **Middleware**: Intercepts `/admin/*` routes, redirecting unauthenticated visitors to `/admin/login`.
  - **Server Components**: Each admin page (`/admin/about`, `/admin/experience`) awaits `AuthServerService.isAdmin()`, redirecting unauthorized users.
  - **Route Handlers**: Every API route (`/api/admin/about`, `/api/admin/experience`, `/api/admin/experience/[id]`, `/api/admin/experience/reorder`) verifies `AuthServerService.isAdmin()`, rejecting unauthorized requests with `403 Forbidden`.
  - **Database Layer**: PostgreSQL Row Level Security (RLS) policies allow public `SELECT` only on published and enabled records; all `INSERT`, `UPDATE`, and `DELETE` queries require `public.is_admin()`.

---

## 6. Verification & Automated Test Suite
- Automated test script: `scripts/test-phase7.mjs`
- Test coverage (21 test cases):
  1. Unauthenticated rejection (403 Forbidden) on all admin endpoints.
  2. About CMS read, update, validation, and public page synchronization.
  3. Experience CMS creation validation (missing company/role).
  4. Experience creation, reading, and updating.
  5. Experience reordering.
  6. Experience enable/disable toggling and public filtering verification.
  7. Destructive deletion confirmation and removal.
