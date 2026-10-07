# Phase 15: Settings CMS & Global Site Configuration

This document specifies the architecture, authoritative data sources, security model, and management workflows for the **Settings CMS (Phase 15)** of the Machine Learning Engineer portfolio project.

---

## 1. System Overview

The Settings CMS provides a centralized, authoritative interface at `/admin/settings` for managing global website defaults, search engine optimization metadata, brand assets, and safe administrative preferences.

### Key Principles:
1. **Single Source of Truth**: Every setting has exactly one authoritative owner. Settings CMS manages global website attributes and **does not duplicate** data owned by other CMS modules (e.g. Profile, Hero, About, Projects, Certifications, Contact, or Media Manager).
2. **Visual Consistency (No Arbitrary CSS)**: Appearance settings are restricted to architectural design tokens (theme mode, curated WCAG AA accent palettes). Raw CSS, HTML injection, and unconstrained color pickers are strictly disallowed.
3. **Media Centralization**: Assets (Brand Logo, Browser Favicon, Resume PDF, and Social Preview OG Image) are selected directly from the Media Library using `MediaSelectorModal`. Removing a reference never deletes the physical asset.
4. **Draft / Preview / Publish Integration**: Public-facing settings participate in the Phase 13 content lifecycle. Changes can be saved as a draft, verified in Preview Mode (`/admin/preview`), and published to the live site with zero public draft leakage.
5. **Credentials Isolation**: Server secrets (Supabase service keys, database passwords, JWT secrets) are stored exclusively in environment variables and are never surfaced to or editable via client forms.

---

## 2. Settings Architecture & Data Model

### Database Table (`public.site_settings`)

```sql
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Profile CMS Authority
    name TEXT NOT NULL DEFAULT 'Mohamed Khaled',
    professional_title TEXT NOT NULL DEFAULT 'Machine Learning Engineer',
    subtitle TEXT NOT NULL DEFAULT 'Turning Data Into Intelligent Solutions',
    bio TEXT NOT NULL DEFAULT '...',
    email TEXT NOT NULL DEFAULT 'mohamed@example.com',
    phone TEXT,
    location TEXT DEFAULT 'Cairo, Egypt',
    social_links JSONB NOT NULL DEFAULT '...'::jsonb,
    profile_image TEXT,
    profile_image_url TEXT,
    hero_title TEXT NOT NULL DEFAULT 'Mohamed Khaled',
    hero_subtitle TEXT NOT NULL DEFAULT 'Machine Learning Engineer',
    hero_media TEXT,
    hero_media_url TEXT,

    -- Settings CMS Authority: General
    site_name TEXT DEFAULT 'Mohamed Khaled Portfolio',
    site_description TEXT DEFAULT 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
    default_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    logo TEXT,
    logo_url TEXT,
    favicon TEXT,
    favicon_url TEXT,
    resume TEXT,
    resume_url TEXT,

    -- Settings CMS Authority: SEO & Social
    seo_title TEXT NOT NULL DEFAULT 'Mohamed Khaled | Machine Learning Engineer Portfolio',
    seo_description TEXT NOT NULL DEFAULT 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
    og_image TEXT,
    og_image_url TEXT,
    canonical_url TEXT DEFAULT 'https://mohamedkhaled.dev',
    allow_indexing BOOLEAN DEFAULT true,

    -- Settings CMS Authority: Appearance
    theme_preference TEXT DEFAULT 'dark',
    accent_color TEXT DEFAULT 'amber',

    -- Settings CMS Authority: System
    default_items_per_page INT DEFAULT 10,
    enable_contact_form BOOLEAN DEFAULT true,
    analytics_enabled BOOLEAN DEFAULT false,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## 3. Settings Groups & Functional Specifications

### 3.1 General Settings
- **Website Name (`site_name`)**: Global brand name displayed in headers, footers, and meta titles.
- **Site Description (`site_description`)**: Fallback summary for document metadata and SEO snippets.
- **Default Language (`default_language`)**: HTML `lang` attribute and localization code (e.g. `en` or `en-US`).
- **Timezone (`timezone`)**: Standard timezone for logging and scheduling (e.g. `UTC` or `Africa/Cairo`).
- **Media References**:
  - **Brand Logo (`logo_url`)**: Custom brand graphic displayed in the header navbar (with graceful fallback to MK monogram).
  - **Browser Favicon (`favicon_url`)**: Custom tab icon referenced in `<link rel="icon">`.
  - **Resume / CV (`resume_url`)**: Primary curriculum vitae document for public download.

### 3.2 SEO & Social Settings
- **Default Document Title (`seo_title`)**: Document title rendered in `<title>` and search engine results.
- **Default Meta Description (`seo_description`)**: High-relevance meta description snippet.
- **Canonical Base URL (`canonical_url`)**: Authoritative base URL to prevent duplicate content indexing.
- **Social Preview Image (`og_image_url`)**: High-resolution Open Graph / Twitter Card preview graphic (recommended 1200×630).
- **Search Engine Indexing (`allow_indexing`)**: Toggle managing `<meta name="robots" content="index, follow">` vs `"noindex, nofollow"`.

### 3.3 Appearance Settings
- **Theme Mode (`theme_preference`)**:
  - `'dark'`: Obsidian (#080B11) dark space aesthetic.
  - `'system'`: Automatically synchronizes with the visitor's operating system preferences.
- **Accent Color Preset (`accent_color`)**:
  - `amber`: Warm engineering glow (Default Phase 2 palette).
  - `emerald`: Clean production health & data science green.
  - `cyan`: High-throughput cloud pipeline & neural inference cyan.
  - `indigo`: Sophisticated deep learning research indigo.

### 3.4 System Preferences
- **Default Items Per Page (`default_items_per_page`)**: Configurable pagination default (10, 25, 50) for administrative lists.
- **Enable Contact Messaging (`enable_contact_form`)**: Master switch allowing public visitors to submit inquiries.
- **Telemetry & Web Vitals (`analytics_enabled`)**: Anonymous performance metric tracking toggle.

---

## 4. Source-of-Truth Boundary Matrix

| Setting / Data Field | Authoritative CMS Module | Secondary / Consuming Components |
| :--- | :--- | :--- |
| **Personal Name & Title** | **Profile CMS** (`/admin/profile`) | Navbar, Hero Section, SEO fallback |
| **Biography & Headshot** | **Profile CMS** (`/admin/profile`) | About Section, Hero Section |
| **Contact Email & Phone** | **Contact CMS** (`/admin/contact`) | Contact Section, Footer |
| **Social Media Links** | **Contact & Social CMS** (`/admin/contact`) | Navbar, Contact Section, Footer |
| **Website Name & Logo** | **Settings CMS** (`/admin/settings`) | Navbar, Footer, Open Graph |
| **SEO Defaults & Robots** | **Settings CMS** (`/admin/settings`) | HTML `<head>`, Social Sharing |
| **Theme & Accent Presets** | **Settings CMS** (`/admin/settings`) | Global design system layout |
| **Media Files & Storage** | **Media Manager** (`/admin/media`) | Profile, Projects, Certs, Settings |

---

## 5. Security & Access Control

1. **Authentication**: All endpoints (`/admin/settings`, `/api/admin/settings`) enforce `AuthServerService.isAdmin()`. Unauthenticated requests receive **HTTP 403 Forbidden** (or HTTP 307 redirect to login for pages).
2. **Payload Whitelisting**: The update API strictly sanitizes and whitelists permitted fields, ignoring unauthorized or arbitrary attributes.
3. **URL Validation**: Canonical URLs and external references must be valid HTTP/HTTPS URLs. Malformed strings are rejected with **HTTP 400 Bad Request**.
4. **Credential Isolation**: Database passwords, Supabase service-role keys, and JWT secrets are kept exclusively in server environment variables and never exposed to the client.

---

## 6. Draft, Preview, and Publishing Lifecycle

- **Save Draft**: Staging changes sends `POST /api/admin/drafts` with `entity_type: 'site_settings'`. The staged draft is stored safely in `public.drafts`.
- **Preview Mode**: Visiting `/admin/preview` dynamically overlays the staged `site_settings` draft on top of published baseline content.
- **Live Publishing**: Clicking "Save & Publish Live" (or publishing through `/admin/publishing`) immediately updates the active `site_settings` record and calls `revalidatePath('/')` to refresh public server cache.
- **Public Isolation**: Unauthenticated public visitors on `/` strictly see the published values until publication is explicitly triggered.

---

## 7. Automated Test Coverage

The test suite [`scripts/test-phase15.mjs`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/scripts/test-phase15.mjs) validates all 11 core requirements:
- **46 / 46 Tests Passed (100% Pass Rate)**:
  - Security & 403 authorization checks.
  - Authoritative settings retrieval.
  - Validation rules (empty name, malformed URL, invalid themes rejected).
  - General settings persistence (name, description, language, timezone).
  - SEO settings & public HTML metadata generation.
  - Appearance and system preferences.
  - Media reference linking and reference tracking in Media Manager.
  - Non-destructive media unlinking.
  - Draft isolation and preview verification.
  - Single source-of-truth preservation.
  - Admin dashboard and sidebar navigation.
  - Cross-module regression verification.

---

## 8. Known Limitations

- **Arbitrary Color Picker**: Intentionally omitted to protect visual brand identity and contrast compliance.
- **Maintenance Mode**: Not implemented in Phase 15 as it was not part of the initial architecture specification.
