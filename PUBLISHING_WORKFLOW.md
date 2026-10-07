# Phase 13: Draft / Preview / Publish Content Lifecycle

This document defines the architectural specification, lifecycle transitions, security safeguards, and operational workflows for drafting, previewing, publishing, and discarding content within the Machine Learning Portfolio CMS.

---

## 1. Lifecycle State Definitions

The portfolio utilizes a centralized 3-state content model across all CMS entities:

| State | Public Visitor Visibility | Admin Editor Visibility | Preview Mode (`/admin/preview`) | Discardable |
| :--- | :--- | :--- | :--- | :--- |
| **`published`** | **Visible** (if section/entity is `enabled = true`) | Visible (baseline state) | Visible (as fallback or baseline) | No (canonical live data) |
| **`draft`** | **Hidden** (zero public leakage) | Staged in Publishing Hub & editors | **Rendered** (overlaid onto published baseline) | **Yes** (restores published baseline) |
| **`archived`** | **Hidden** | Retained for reference/restoration | **Hidden** (never previewed) | No (managed in entity CMS) |

---

## 2. Core Operational Workflows

### 2.1 Staging a Draft (`Save Draft`)
- Administrators make edits in any CMS module (Hero/Profile, About, Experience, Skills, Projects, Certifications, Contact, Social, or Global Sections).
- Choosing **"Save Draft"** commits the proposed changes into the authoritative `cms_drafts` staging table (keyed by `entity_type` and `entity_id`).
- For discrete items (like Projects, Experience, Certifications), new records can also be flagged with `status = 'draft'`.
- The live public site continues to display the existing published version untouched.

### 2.2 Authenticated Preview Mode (`/admin/preview`)
- Only authenticated administrators with valid sessions/credentials can access `/admin/preview` (or the `/preview` redirect).
- Unauthenticated requests are rejected and redirected to `/admin/login`.
- The preview page dynamically synthesizes content using [PreviewService](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/preview.service.ts):
  1. Retrieves all published baseline content.
  2. Queries active drafts from `cms_drafts`.
  3. Overlays draft modifications on top of the published baseline.
  4. Gracefully falls back to published content for any modules without active drafts.
- A non-intrusive, sticky **Preview Banner** is displayed at the top showing the count of staged drafts, quick actions to publish all drafts or open the Publishing Hub, and an **"Exit Preview"** button returning directly to `/admin/publishing`.

### 2.3 Publishing Content (`Publish`)
- Publishing can be performed per draft item or globally ("Publish All Pending Changes").
- When publishing is triggered:
  1. The draft payload is validated against entity business rules.
  2. The staged content is atomically committed into the canonical table (or updated to `status = 'published'`).
  3. The draft record is removed from `cms_drafts`.
  4. Server cache revalidation (`revalidatePath('/')`, `revalidatePath('/admin/publishing')`, etc.) executes immediately.
  5. The public portfolio reflects the new content instantly on subsequent page requests.

### 2.4 Discarding Drafts (`Discard`)
- If an admin decides not to publish staged changes, they can discard an individual draft or discard all drafts.
- Discarding deletes the draft record from `cms_drafts` without modifying the underlying published baseline or deleting live media references.
- Preview mode immediately reverts to rendering the canonical published state.

---

## 3. Public Site Isolation & Zero Leakage

Public routes (`/` and subroutes) execute strict server-side queries that filter for `status = 'published'` and `enabled = true`:
- Draft entries never touch public query pipelines.
- Draft section ordering or visibility changes (staged under `entity_type: 'sections_order'`) do not affect the public DOM or Public Navbar until published.
- Preview data queries are explicitly isolated to the `/admin/preview` route and guarded by `AuthServerService.isAdmin()`.

---

## 4. Entity-Level Publishing Behavior

1. **Profile & Hero (`site_settings`)**:
   - Staged as `entity_type = 'site_settings'`.
   - Modifies headlines, bio, titles, avatar URLs, contact details, and hero CTAs in draft.
   - Public hero displays only published settings.
2. **Sections Order & Visibility (`sections_order`)**:
   - Reordering sections or toggling enable/disable state can be staged in draft.
   - Preview reflects reordered sections and hides draft-disabled sections.
   - Public portfolio retains canonical published ordering and active links until published.
3. **Projects, Experience, & Certifications**:
   - Discrete entities support both inline `status = 'draft'` and staging updates via `cms_drafts`.
   - Draft projects appear only in Admin and Preview; public cards only show published entries.
4. **Skills & Categories**:
   - Category updates and skill proficiencies staged in draft appear in preview without altering public badges.
5. **Contact & Social Links**:
   - Availability message, recipient email, and social anchor links are staged safely and published upon review.

---

## 5. Security & Authorization

- **Admin-Only Guards**: All draft mutations (`POST /api/admin/drafts`, `DELETE /api/admin/drafts/[id]`, `POST /api/admin/publishing/publish`, `POST /api/admin/publishing/discard`) require verified administrator cookies/tokens.
- **Server-Side Defense**: Unauthenticated API calls return `403 Forbidden`.
- **Database RLS**: In PostgreSQL/Supabase, the `cms_drafts` table is protected with Row Level Security restricting all SELECT, INSERT, UPDATE, and DELETE operations to authenticated `service_role` and admin users (`auth.jwt() ->> 'role' = 'authenticated'`).

---

## 6. Known Limitations & Extensibility

- **Single Active Draft Per Entity**: Each entity ID supports one pending draft at a time (e.g. updating a draft replaces the existing staged version rather than branching into multiple named draft trees).
- **Media Asset Lifecycle**: Deleting or discarding a draft does not delete referenced media files in storage to prevent accidental loss of assets that may be reused.
- **Atomic Batching**: Multi-entity batch publishing executes sequentially in memory with optimistic rollback on validation error.
