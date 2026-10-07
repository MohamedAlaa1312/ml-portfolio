# CMS Architecture & Lifecycle Specification

This specification documents the complete content architecture for the Machine Learning Portfolio CMS, covering entity storage, schema design, authorization, section management, and the content publication lifecycle (Phases 0 through 13).

---

## 1. Architectural Overview

The CMS is designed around an authoritative, relational data model backed by PostgreSQL (Supabase) with an in-memory/client fallback store for standalone local development.

```
                           +---------------------------+
                           |   Admin Dashboard & CMS   |
                           +-------------+-------------+
                                         |
                                         v
                      +-------------------------------------+
                      | Staging Layer: `cms_drafts` Table   |
                      +------------------+------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
             [ Preview Pipeline ]                 [ Publish Pipeline ]
             `/admin/preview`                     `/api/admin/publishing/publish`
             - Admin Auth Guarded                 - Validates Staged Data
             - Overlays Draft on Baseline         - Commits to Production Tables
             - Fallback to Published              - Evicts & Revalidates Caches
                       |                                   |
                       +-----------------+                 v
                                         |    +-------------------------+
                                         |    | Canonical Live Tables   |
                                         |    | - site_settings         |
                                         |    | - sections              |
                                         |    | - projects              |
                                         |    | - experience            |
                                         |    | - certifications        |
                                         |    | - skills                |
                                         |    +------------+------------+
                                         |                 |
                                         |                 v
                                         |    +-------------------------+
                                         |    | Public Portfolio (`/`)  |
                                         |    | - status = 'published'  |
                                         |    | - enabled = true        |
                                         |    | - Zero Draft Leakage    |
                                         |    +-------------------------+
```

---

## 2. Entity Model & Storage Strategy

### 2.1 Centralized Site Settings (`site_settings`)
- Stores singleton configuration: author name, titles, biography, avatar image URLs, resume links, and contact coordinates.
- Social links are stored in structured JSONB (`social_links`) with ordering and visibility controls.

### 2.2 Global Sections (`sections`)
- Represents top-level portfolio blocks: `hero`, `about`, `experience`, `skills`, `projects`, `certifications`, and `contact`.
- Core columns: `id`, `slug`, `title`, `type`, `display_order`, `enabled`, `status`, `content` (JSONB).
- Hero section is permanently protected from deletion and disabling to preserve identity integrity.

### 2.3 Discrete Content Entities
- `projects`: Title, slug, description, technologies (array), gallery URLs (array), repository link, demo URL, featured flag, display order, status.
- `experience`: Company, role, dates, location, responsibilities, technologies, status.
- `certifications`: Title, issuer, issue date, credential ID, credential URL, status.
- `skills`: Name, category ID, proficiency, display order, status.

---

## 3. The 3-State Lifecycle Model

1. **`published`**: Active production content. Visible to normal public visitors if the containing section and item are enabled.
2. **`draft`**: Uncommitted content. Staged in `cms_drafts` or marked `status = 'draft'`. Visible solely in Admin editing tools and authorized Preview (`/admin/preview`).
3. **`archived`**: Inactive historical content. Retained in database for audit and reactivation, but excluded from both public rendering and preview.

---

## 4. Preview & Publishing Engine

- **Preview Synthesis**: [PreviewService](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/preview.service.ts) queries live records and merges draft staged payloads in memory. Deep cloning is employed to prevent accidental store mutation.
- **Section Polymorphism**: [SectionRenderer](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/components/dynamic-sections/SectionRenderer.tsx) dynamically evaluates `section.type` and respects the `isPreview` flag, enforcing `published` strictly on `/` while previewing `draft` on `/admin/preview`.
- **Atomic Single & Bulk Publishing**: [AdminService](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/admin.service.ts) allows selective per-entity publishing or all-at-once publishing with instant Next.js cache revalidation (`revalidatePath`).
- **Safe Discard**: Unwanted drafts can be purged without disturbing canonical published content or associated media assets.

---

## 5. Security & Authorization Architecture

- **Defense-in-Depth**: All administrative and staging endpoints check `AuthServerService.isAdmin()`.
- **Strict Public Isolation**: Public data services query with explicit `.eq('status', 'published')`.
- **Database Row-Level Security**: Direct client-side access to draft records is denied via PostgreSQL RLS policies.
