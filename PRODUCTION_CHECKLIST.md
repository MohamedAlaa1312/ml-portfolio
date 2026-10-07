# Production Deployment Checklist

A comprehensive verification checklist to confirm production readiness before publishing the Machine Learning Engineer portfolio live.

---

## 1. Environment & Configuration
- [ ] Production domain decided and configured (`NEXT_PUBLIC_SITE_URL`).
- [ ] Client-safe variables configured in production hosting platform:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- [ ] Server-only secrets configured in production environment (e.g. `SUPABASE_SERVICE_ROLE_KEY`).
- [ ] No `.env` or `.env.local` files tracked by Git (`git check-ignore` verified).
- [ ] `.env.example` contains only sanitized placeholder values.
- [ ] `.nvmrc` specifies correct Node.js LTS version (v20+).

---

## 2. Authentication & Admin Authorization
- [ ] Supabase Auth configured with production domain in **Site URL** and **Redirect URLs**.
- [ ] Administrator user account created in Supabase Auth.
- [ ] Administrator authorized via `supabase/authorize_admin.sql` in `public.admin_users`.
- [ ] Admin password verified as secure and uncommitted to code/logs.
- [ ] Edge middleware (`src/middleware.ts`) actively protecting all `/admin/*` routes.
- [ ] Non-admin or unauthenticated access to `/admin` routes safely redirects to `/admin/login`.
- [ ] Logout route (`/api/auth/logout`) terminates session and purges auth cookies.

---

## 3. Database & Row Level Security (RLS)
- [ ] Production schema successfully executed via `supabase/schema.sql`.
- [ ] Row Level Security (RLS) enabled on all 11 application tables:
  - `site_settings`
  - `sections`
  - `projects`
  - `skills`
  - `experience`
  - `certifications`
  - `contact` / `social_links`
  - `media`
  - `cms_drafts`
  - `admin_users`
  - `theme_settings`
- [ ] `public.is_admin()` security definer function verified active.
- [ ] Public users restricted strictly to `status = 'published'` reads.
- [ ] Public mutations (INSERT, UPDATE, DELETE) strictly blocked on all tables.

---

## 4. Media Storage & Assets
- [ ] Supabase Storage buckets created: `portfolio-media` (public) and `portfolio-private` (private).
- [ ] Storage RLS policies enabled (public read on `portfolio-media`, admin-only write).
- [ ] Public static images verified (`/images/profile.jpg`, project mockups, badges).
- [ ] Local uploads directory (`public/uploads`) excluded from Git with `.gitkeep` intact.
- [ ] Zero broken media links across all theme templates.

---

## 5. Themes & Design Systems
- [ ] Theme 1: **Modern Technical Editorial** (`modern-editorial`) verified and responsive.
- [ ] Theme 2: **Precision Dark Portfolio** (`precision-dark`) verified and responsive.
- [ ] Theme 3: **Structured Monochrome** (`structured-monochrome`) verified and responsive.
- [ ] Theme Registry resolves active theme cleanly with fallback to default.
- [ ] Live theme preview (`/admin/preview?theme=<slug>`) operational for admin users.
- [ ] Theme publishing integration (`/admin/themes`) updates active theme in CMS.

---

## 6. Content Management & Publishing
- [ ] Profile CMS populated with real user identity, titles, and bio.
- [ ] About section populated with real engineering philosophy and capabilities.
- [ ] Experience section contains real career milestones and achievements.
- [ ] Skills taxonomy reflects verified technical specializations.
- [ ] Projects showcase real ML models, architectures, metrics, and links.
- [ ] Certifications reflect verified credentials with working verification URLs.
- [ ] Sections CMS correctly orders and toggles active sections.
- [ ] Draft & Publish workflow operates atomically without leaving uncommitted orphans.

---

## 7. SEO, Metadata & Branding
- [ ] Page title and meta description configured via `CmsService.getSiteSettings()`.
- [ ] Dynamic Open Graph tags (og:title, og:description, og:image, og:url) verified.
- [ ] Twitter card metadata configured (`summary_large_image`).
- [ ] Favicon (`favicon.ico`) verified and rendered in browser tabs.
- [ ] Robots meta directives configured (index/follow allowed).
- [ ] Canonical URLs dynamically generated from `NEXT_PUBLIC_SITE_URL`.

---

## 8. Build, Lint & Type Safety
- [ ] TypeScript typecheck passes with 0 errors: `npm run typecheck`.
- [ ] ESLint passes with 0 errors: `npm run lint`.
- [ ] Production build passes with 0 errors: `npm run build`.
- [ ] Next.js lockfile (`package-lock.json`) preserved and up-to-date.
- [ ] CI pipeline (`.github/workflows/ci.yml`) enabled and configured.

---

## 9. Error Handling & 404
- [ ] Custom 404 page (`src/app/not-found.tsx`) returns branded interface and return link.
- [ ] Production error boundary (`src/app/error.tsx`) catches runtime errors without leaking stack traces.
- [ ] Unauthorized admin routes safely display error banner without exposing backend details.

---

## 10. Security Invariants
- [ ] Zero passwords, service-role keys, or tokens committed in Git history.
- [ ] Zero `dangerouslySetInnerHTML` usage with unvalidated input.
- [ ] Zero open redirect vulnerabilities (strictly relative admin redirection).
- [ ] HTTP security headers configured in `next.config.ts`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 11. Final Smoke Test Sign-off
- [ ] Public homepage loads cleanly under 1.5s.
- [ ] Admin login functions as intended.
- [ ] Admin CMS updates save and persist to database.
- [ ] Draft preview accurately reflects pending changes.
- [ ] Publishing workflow updates public view immediately.
- [ ] Application approved for Phase 26 deployment.
