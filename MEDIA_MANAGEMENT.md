# Phase 14: Centralized Media Management System

This document outlines the architecture, data models, workflows, security boundaries, and operational procedures implemented for **Phase 14 (Media Management)** of the Machine Learning Engineer portfolio CMS.

---

## 1. System Overview

The Media Management system provides a centralized repository and asset lifecycle manager for all media (images and documents) utilized throughout the portfolio. It bridges database metadata with storage objects while enforcing reference tracking and used-media protection.

### Key Capabilities:
- **Centralized Media Library (`/admin/media`)**: High-performance grid and list views with file previews, dimension badges, file sizes, MIME type badges, and real-time usage indicators.
- **Used Media Protection**: Prevents accidental deletion of media referenced by active content (Profile, Hero, About, Projects, Certifications, Experience, or active Drafts).
- **Reusable Media Selector**: A unified modal (`MediaSelectorModal`) integrated into CMS editors (`ProfileHeroEditor`, `ProjectForm`, `CertificationForm`, `ExperienceForm`) for 1-click media reuse without duplicate uploads.
- **Safe Upload Pipeline**: Robust validation (MIME types, file extensions, max 5MB for images, max 10MB for documents), secure storage key naming, and automatic metadata extraction.
- **Metadata Management**: Edit human-readable titles, alt text (required for WCAG accessibility and SEO), and internal usage descriptions.
- **Scalable Discovery**: Instant search (title, file name, description, alt text, MIME type), category filtering (All, Images, Documents), and flexible multi-criteria sorting (Newest, Oldest, Name, File Size).
- **Dashboard & Navigation Integration**: The Admin Sidebar features an enabled `Media` link (`/admin/media`), and the Admin Dashboard displays live asset metrics and quick navigation.

---

## 2. Storage Model & Data Architecture

### Database Schema (`public.media`)

```sql
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'document', 'video')),
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  alt_text TEXT,
  title TEXT,
  description TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Storage Buckets & Local Fallback Strategy
1. **Cloud Mode (Supabase Storage)**:
   - Images are saved to `portfolio-images` with `contentType` preserved.
   - Documents (PDFs) are saved to `portfolio-documents`.
   - File keys follow the collision-resistant pattern: `${Date.now()}-${sanitizedBaseName}`.
2. **Local Development Fallback**:
   - When Supabase credentials are not configured or cloud storage is temporarily unreachable, assets are written directly to `public/uploads/` on the server disk.
   - Assets are served via `/uploads/${storagePath}`.
   - Deletion removes the file from disk using Node.js `fs.unlinkSync`.

---

## 3. Reference Tracking & Deletion Protection

### Reference Discovery Engine (`getMediaUsage`)
Before any asset can be deleted, the system executes an exhaustive reference scan across all CMS entities:
1. **Site Settings & Hero**: Scans `profile_image`, `profile_image_url`, `hero_media`, `hero_media_url`, `resume_url`, `resume`, `logo_url`, `logo`.
2. **Section Custom Content**: Scans section content payloads (e.g., `sec-about` avatar and portraits).
3. **Projects**: Scans `thumbnail`, `thumbnail_url`, and `gallery_urls` across all projects.
4. **Certifications**: Scans `image` and `image_url` across all certifications.
5. **Experience**: Scans `company_logo` and `company_logo_url` across all experience entries.
6. **Active Drafts**: Scans all staged draft modification payloads for pending media references (`isDraft: true`).

### Protection Rules (Requirement 20)
- **Active References Present**:
  - `DELETE /api/admin/media/[id]` **rejects the deletion request with HTTP 400 Bad Request**.
  - Returns a detailed error message citing the specific referencing items:
    `"Cannot delete media: it is currently referenced by 2 active content item(s) (Profile & Hero Identity, Section: About Me). Remove these references before deleting."`
  - The Media Manager UI locks the delete button and presents a "🛡️ Protected (In Active Use)" badge with the reference list.
- **Zero References (Unused Asset)**:
  - Deletion is permitted upon explicit admin confirmation.
  - Storage file and metadata database record are cleaned up atomically.

---

## 4. Reusable Media Selector Integration

Instead of isolated file upload inputs in every CMS form, all content modules now use the unified `MediaSelectorModal`:
- **Profile & Hero CMS**: Select or replace profile photo and resume PDF.
- **Projects CMS**: Select or replace cover thumbnail and project screenshots.
- **Certifications CMS**: Select or replace certificate credential badge.
- **Experience CMS**: Select or replace company logos.

### Selector UX Workflow:
1. Click **"Select from Library"** next to the URL input.
2. Modal opens with 2 tabs:
   - **"Browse Library"**: Search, filter by type, and click any existing asset to inspect and select.
   - **"Upload New"**: Drag-and-drop or browse to upload an asset, which automatically registers in the library and auto-selects it for the form.
3. The selector returns the chosen asset's URL and alt text to the parent CMS form.

---

## 5. Draft / Preview / Publish Integration (Phase 13 Coexistence)

Media changes strictly adhere to the content lifecycle established in Phase 13:
1. **Selecting / Replacing Media in a Form**:
   - Saves into the active draft staging layer (e.g., `draft-site_settings-singleton` or `draft-project-1`).
   - The media reference engine detects the reference in the draft and marks the asset as referenced (`isDraft: true`).
2. **Preview Mode (`/admin/preview`)**:
   - Renders the newly selected draft media immediately for review.
3. **Public Homepage (`/`)**:
   - Strictly renders the existing published media asset until the admin explicitly publishes the draft.
   - Zero leakage of draft media references to the public.
4. **Replacing Media Assets**:
   - Replaces the reference in the content record; it **does NOT delete the old media asset from the Media Library**. The old asset remains in the library and may be reused or deleted later if unused.

---

## 6. Security & Storage Policies (RLS)

1. **Authentication & Authorization**:
   - All management endpoints (`/api/admin/media`, `/api/admin/media/[id]`, `/api/admin/media/stats`, `/api/admin/upload`) enforce `AuthServerService.isAdmin()`.
   - Unauthenticated requests are rejected with **HTTP 403 Forbidden**.
   - Admin page `/admin/media` redirects unauthenticated users to `/admin/login`.
2. **Storage Policies**:
   - Public read access is granted only to assets referenced by published content.
   - Unrestricted direct bucket directory browsing is blocked.
   - File uploads are validated server-side for allowed MIME types and size boundaries before saving.
   - Storage identifiers use safe alphanumeric prefixes and timestamps to prevent path traversal.

---

## 7. Automated Verification Results

A dedicated automated test suite (`scripts/test-phase14.mjs`) validates the entire Phase 14 system:
- **59 / 59 Tests Passed (100% Pass Rate)**:
  - Security & 403 authorization checks.
  - Search, filter, and sort verification.
  - Reference tracking & used media protection (HTTP 400 rejection).
  - Metadata editing and persistence (title, alt text, description).
  - File upload validation (unsupported MIME rejected, oversized rejected).
  - Upload & safe deletion lifecycle.
  - Admin dashboard & sidebar integration.
  - Draft isolation & reference tracking.
  - Cross-module regression verification (Phases 0–13).

---

## 8. Known Limitations

- **Image Transformations / WebP Compression**: Automatic on-the-fly thumbnail generation requires external cloud workers or Next.js Image Optimization; uploaded images currently preserve their native uploaded dimensions.
- **Bulk Delete**: Deliberately excluded in Phase 14 per specification requirements to prevent bulk deletion accidents of production assets.
