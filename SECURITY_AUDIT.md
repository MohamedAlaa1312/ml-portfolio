# Phase 17: Admin Security Hardening & Authorization Audit

This document provides a comprehensive security assessment, hardening report, and verification audit for the **Machine Learning Engineer Portfolio (Phase 17)**. It documents the authentication architecture, server-side authorization enforcement, database Row Level Security (RLS), Supabase Storage policies, input sanitization, and privilege escalation defenses.

---

## 1. Authentication Model

* **Provider**: Supabase Auth (GoTrue).
* **Storage**: Handled exclusively inside `auth.users` managed by Supabase. Passwords are never stored in application tables, CMS records, `.env` files, browser storage, or Git repositories.
* **Session Lifecycle**:
  - Handled via standard `@supabase/ssr` cookies stored in standard HTTP headers.
  - Edge middleware inspects and automatically refreshes auth sessions on each incoming request.
  - Sign-out (`/api/auth/logout`) terminates the remote session token, cleanses session cookies, and purges developer preview cookies (`sb-admin-auth-preview`).
* **Authentication vs Authorization**: Authentication establishes the user's identity (`auth.uid()`), but **never** grants administrative privileges on its own.

---

## 2. Admin Authorization Model & Single Source of Truth

There is exactly **ONE** authoritative source of truth for administrative privileges:

```
[Incoming Request]
        │
        ▼
[Next.js Edge Middleware]
        │
        ├── Session Check (supabase.auth.getUser())
        │
        └── Admin Authorization Verification
                ├── Fast-path: JWT app_metadata.role IN ('admin', 'superadmin')
                └── Authoritative: public.admin_users table (user_id = auth.uid())
```

### Authorization Principles
1. **Never Trust the Client**: Frontend state, hidden buttons, and route guards are considered UI affordances, not security boundaries.
2. **Server-Side Enforcement**: All `/admin/*` pages check `AuthServerService.isAdmin()` before rendering, and all 32 `/api/admin/*` route handlers reject unauthorized requests with HTTP `403 Forbidden`.
3. **No Hardcoded Identity Checks**: Authorization logic never checks email addresses (e.g. `if email === ...`). Privileges are strictly linked to stable UUIDs (`user_id`) in `public.admin_users`.
4. **Theme Section Reusability**: The planned Phase 18+ Themes module will be placed under `/admin/themes` and will automatically inherit this exact authorization enforcement without code refactoring.

---

## 3. Database Row Level Security (RLS) Model

Row Level Security is enabled on **every** table in the PostgreSQL `public` schema:

| Table | Public (`anon`) Access | Authenticated Non-Admin Access | Authorized Admin Access |
| :--- | :--- | :--- | :--- |
| `public.site_settings` | `SELECT` (Public read-only) | `SELECT` (Read-only) | `ALL` (Governed by `public.is_admin()`) |
| `public.sections` | `SELECT` (`status = 'published' AND enabled = true`) | `SELECT` (Published only) | `ALL` (Governed by `public.is_admin()`) |
| `public.projects` | `SELECT` (`status = 'published'`) | `SELECT` (Published only) | `ALL` (Governed by `public.is_admin()`) |
| `public.skills` | `SELECT` (`enabled = true`) | `SELECT` (Enabled only) | `ALL` (Governed by `public.is_admin()`) |
| `public.experience` | `SELECT` (`status = 'published' AND enabled = true`) | `SELECT` (Published only) | `ALL` (Governed by `public.is_admin()`) |
| `public.certifications` | `SELECT` (`status = 'published'`) | `SELECT` (Published only) | `ALL` (Governed by `public.is_admin()`) |
| `public.media` | `SELECT` (Metadata read-only) | `SELECT` (Metadata read-only) | `ALL` (Governed by `public.is_admin()`) |
| `public.admin_users` | **DENIED** (`0` access) | `SELECT` (`user_id = auth.uid()`) | `ALL` (`USING (public.is_admin())`) |
| `public.cms_drafts` | **DENIED** (`0` access) | **DENIED** (`0` access) | `ALL` (`USING (public.is_admin())`) |

### Privilege Escalation Immunity
Any direct SQL or API request by an authenticated non-admin to insert into `public.admin_users`:
```sql
INSERT INTO public.admin_users (user_id, role) VALUES (auth.uid(), 'admin');
```
is rejected by the PostgreSQL engine with:
```
ERROR: new row violates row-level security policy for table "admin_users"
```
Users cannot self-assign admin roles or escalate privileges.

---

## 4. Supabase Storage Security Policies

Storage buckets (`portfolio-images`, `portfolio-videos`, `portfolio-documents`) enforce granular policies on `storage.objects`:

* **Read Access**: Permitted publicly for approved media buckets to serve portfolio assets.
* **Write Access (`INSERT`)**: Strictly restricted to `public.is_admin()`.
* **Update Access (`UPDATE`)**: Strictly restricted to `public.is_admin()`.
* **Delete Access (`DELETE`)**: Strictly restricted to `public.is_admin()`.
* **Path Traversal Protection**: Upload handler ([`/api/admin/upload`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/api/admin/upload/route.ts)) validates destination bucket against an explicit allowlist and sanitizes filenames via `path.basename()` removing any directory traversal characters (`../`).

---

## 5. Protected Routes & Navigation Security

Edge Middleware ([`src/middleware.ts`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/middleware.ts)) intercepts all traffic targeting `/admin/*`:

1. **Unauthenticated Request $\to$ `/admin/*`**:
   - Redirected to `/admin/login?redirect=<safe_path>`.
2. **Authenticated Non-Admin $\to$ `/admin/*`**:
   - Redirected to `/admin/login?error=unauthorized`.
   - Client-side session is cleanly cleared to prevent unauthorized state.
   - Infinite redirect loop is prevented by checking `isAuthorizedAdmin` on the login route.
3. **Authorized Admin $\to$ `/admin`**:
   - Redirected to `/admin/dashboard`.

---

## 6. CMS Mutation & Mass Assignment Protection

All administrative mutation endpoints enforce strict field allowlists:

* **Site Settings Update** ([`/api/admin/settings`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/api/admin/settings/route.ts)):
  - Whitelist: `site_name`, `site_description`, `default_language`, `timezone`, `logo`, `logo_url`, `favicon`, `favicon_url`, `resume`, `resume_url`, `seo_title`, `seo_description`, `canonical_url`, `og_image`, `og_image_url`, `allow_indexing`, `theme_preference`, `accent_color`, `default_items_per_page`, `enable_contact_form`, `analytics_enabled`.
  - Disallows injecting server credentials, user IDs, or internal table columns.
* **Projects / Experience / Skills Update**:
  - Explicit destructuring and validation of allowed fields.
  - Prohibits client-controlled `owner_id` or database metadata injection.

---

## 7. Draft / Preview / Publish Isolation

* **Draft Secrecy**: Staged drafts are stored in `public.cms_drafts`. RLS permits access **only** to `public.is_admin()`.
* **Preview Isolation**: `/admin/preview` requires administrative authorization. Unauthenticated and non-admin users are blocked from loading draft state.
* **Zero Public Leakage**: The public data loader ([`CmsService`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/services/cms.service.ts)) filters exclusively on `status = 'published'` and `enabled = true`. Staged changes remain completely invisible until explicitly published.
* **Publishing Guards**: Both `/api/admin/publishing/publish` and `/api/admin/publishing/discard` verify `AuthServerService.isAdmin()` before executing.

---

## 8. Application Hardening & Web Vulnerability Defenses

### 1. Security Headers (`next.config.ts`)
* `X-Content-Type-Options: nosniff`: Prevents MIME-confusion attacks.
* `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking and framing by third-party origins.
* `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer data leakage.
* `X-XSS-Protection: 1; mode=block`: Legacy browser XSS filter enforcement.
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables unused hardware APIs.

### 2. Open Redirect Immunity
* Destination URLs in `/api/auth/preview` and `/admin/login` are strictly sanitized:
  - Protocol-relative URLs (`//evil.com`) and backslashes are rejected.
  - Non-relative destinations fallback safely to `/admin/dashboard`.

### 3. Cross-Site Scripting (XSS) & Safe URLs
* Zero instances of `dangerouslySetInnerHTML` across the entire codebase.
* Zero `.innerHTML` assignments.
* [`isValidUrl()`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/lib/social-utils.ts) strictly rejects `javascript:`, `data:`, `vbscript:`, and `file:` schemes.
* All external links enforce `rel="noopener noreferrer"`.

### 4. Error Message Sanitization
* API error responses return sanitized messages (e.g. `'Failed to update project. Please try again.'`).
* Internal stack traces, SQL error details, and database structure are logged server-side only and never surfaced to client responses.

---

## 9. Security Fixes Implemented in Phase 17

1. **Next.js Global Security Headers**: Implemented OWASP-recommended HTTP security headers in `next.config.ts`.
2. **Open Redirect Defenses**: Added strict validation in [`src/app/api/auth/preview/route.ts`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/api/auth/preview/route.ts) and [`src/app/admin/login/page.tsx`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/admin/login/page.tsx) to block external/protocol-relative redirect parameters.
3. **Upload Storage & Path Traversal Hardening**: Restricted upload destinations in [`src/app/api/admin/upload/route.ts`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/src/app/api/admin/upload/route.ts) to `ALLOWED_BUCKETS` and sanitized file basenames via `path.basename()`.
4. **SQL Function Synchronization**: Updated PostgreSQL `public.is_admin()` in `supabase/schema.sql` to support both `'admin'` and `'superadmin'` roles, perfectly synchronizing database RLS and server application logic.
5. **JSX & Text Node Sanitization**: Resolved unescaped quotes in `ContactSection.tsx` and `SectionDisableModal.tsx`, and fixed comment-like text nodes in `Divider.tsx`.
6. **State Cascading Prevention**: Refactored `SectionMetadataModal.tsx` to eliminate `setState` calls within `useEffect`.

---

## 10. Remaining Security Invariants & Limitations

1. **Live Remote Database Configuration**: While SQL migrations and security policies are fully implemented in `supabase/schema.sql` and `supabase/authorize_admin.sql`, deploying them to live production requires executing the migration in the remote Supabase SQL Editor.
2. **Rate Limiting**: Rate limiting for brute-force login attempts is natively provided by Supabase Auth (GoTrue). Adding an application-level Redis rate limiter is unnecessary for this architecture.
