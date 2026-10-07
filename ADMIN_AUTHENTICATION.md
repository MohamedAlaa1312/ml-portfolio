# Phase 16: Admin Account & Authorization Architecture

This document specifies the authentication provider, authorization mechanisms, role source of truth, protected route security, PostgreSQL Row Level Security (RLS) policies, session lifecycles, and provisioning workflows for the **Admin Account & Authorization (Phase 16)** of the Machine Learning Engineer portfolio project.

---

## 1. Architectural Overview & Separation of Concerns

Security in this application is predicated on the strict distinction between **Authentication** and **Authorization**:

* **Authentication (Who you are)**: Managed exclusively by **Supabase Auth** (`auth.users`). Users authenticate via email and secure password hashes (bcrypt/argon2). The application code never stores, hashes, or manipulates raw passwords.
* **Authorization (What you can do)**: Managed exclusively by **PostgreSQL Row Level Security (RLS)** and the **`public.admin_users`** table, supplemented by JWT `app_metadata.role = 'admin'`.

> [!IMPORTANT]
> **Authenticated user $\neq$ Authorized admin.**
> A user successfully authenticating with Supabase Auth does **not** grant administrative privileges. Only accounts whose stable user identifier (`auth.uid()`) is present in `public.admin_users` (or whose signed JWT contains administrative claims) are granted admin capabilities.

---

## 2. Authentication Provider

* **Provider**: Supabase Auth (GoTrue).
* **Client Implementation**: `@supabase/ssr` with standard cookie-based session management across Server Components, Route Handlers, Middleware, and Client Components.
* **Credentials Storage**: Supabase Auth internal tables (`auth.users`). No credentials, hashes, or passwords exist in application tables or source files.
* **Email Normalization**: Login handles case-insensitivity by trimming and lowercasing user input (`.trim().toLowerCase()`) before submission.

---

## 3. Authorization Source of Truth

There is exactly **ONE authoritative source of truth** for administrative privileges:

### Database Level: `public.admin_users` Table
```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Database Security Definer Function: `public.is_admin()`
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
            ) OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Application Server Helper: `AuthServerService.isAdmin()` (`src/services/auth.server.ts`)
1. Checks for active session via `supabase.auth.getUser()`. If no user exists, returns `false`.
2. Inspects trusted server-signed JWT claim `user.app_metadata.role`.
3. Verifies existence in `public.admin_users` table where `user_id = user.id`.
4. Returns `true` only if verified as `'admin'` or `'superadmin'`.

> [!CAUTION]
> **No Hardcoded Email Checks:**
> Authorization NEVER performs checks such as `if (email === 'mohamed13alaa12@gmail.com')`. The target email is purely the initial identity. Authorization is linked to the stable UUID `auth.uid()` in `public.admin_users`.

---

## 4. Protected Routes Matrix

All administrative routes are protected across three defense-in-depth boundaries:
1. **Next.js Edge Middleware** (`src/middleware.ts`)
2. **Server Component Guards** (`AuthServerService.isAdmin()`)
3. **API Route Guards** (`AuthServerService.isAdmin()` returning `403 Forbidden`)

| Route | Minimum Privilege | Unauthenticated Action | Authenticated Non-Admin Action | Authorized Admin Action |
| :--- | :--- | :--- | :--- | :--- |
| `/` (Public Portfolio) | Public (Anon) | Allowed (Public Read) | Allowed (Public Read) | Allowed (Public Read) |
| `/admin` | Admin | Redirect $\to$ `/admin/login` | Redirect $\to$ `/admin/login?error=unauthorized` | Redirect $\to$ `/admin/dashboard` |
| `/admin/login` | Public / Admin | Allowed (Renders Form) | Allowed (Shows Unauthorized Banner + Client SignOut) | Redirect $\to$ `/admin/dashboard` |
| `/admin/dashboard` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/dashboard` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/profile` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/profile` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/about` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/about` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/experience` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/experience` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/skills` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/skills` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/projects` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/projects` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/certifications` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/certifications` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/contact` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/contact` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/sections` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/sections` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/publishing` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/publishing` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/preview` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/preview` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/media` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/media` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/admin/settings` | Admin | Redirect $\to$ `/admin/login?redirect=/admin/settings` | Redirect $\to$ `/admin/login?error=unauthorized` | Allowed |
| `/api/admin/*` | Admin | `403 Forbidden` JSON | `403 Forbidden` JSON | Executed |

---

## 5. PostgreSQL Row Level Security (RLS) Policies

Row Level Security is enabled on **every** table in the `public` schema.

* **Public Read Access**:
  - `site_settings`: Permitted for all (`anon`, `authenticated`).
  - `sections`: Permitted only where `status = 'published' AND enabled = true`.
  - `projects`: Permitted only where `status = 'published'`.
  - `skills`: Permitted only where `enabled = true`.
  - `experience`: Permitted only where `status = 'published' AND enabled = true`.
  - `certifications`: Permitted only where `status = 'published'`.
  - `media`: Permitted for all published asset references.
* **Public & Non-Admin Mutations**:
  - `INSERT`, `UPDATE`, `DELETE` operations on all tables are strictly evaluated against `public.is_admin()`.
  - Attempts by anonymous users or authenticated non-admin users to modify data fail at the database engine level with an RLS violation (`new row violates row-level security policy`).
* **Admin Mutations**:
  - Authorized administrators satisfy `public.is_admin()` and possess full management capabilities across all CMS tables and draft records.

---

## 6. Session Persistence & Logout Lifecycle

* **Session Persistence**:
  - Handled via `@supabase/ssr` cookies stored in standard HTTP headers.
  - Automatically refreshed in middleware on every incoming request.
  - Persists across full page refreshes, tab changes, and browser restarts according to Supabase Auth token expiration settings.
* **Logout Flow**:
  1. User triggers "Sign Out" in `/admin` sidebar.
  2. Form submits `POST` to `/api/auth/logout`.
  3. Server calls `supabase.auth.signOut()`, invalidating the refresh token with Supabase Auth.
  4. Deletes session cookies and preview preview cookie `sb-admin-auth-preview`.
  5. Issues an HTTP 303 Redirect to `/admin/login`.
  6. Subsequent attempts to load `/admin/*` routes are intercepted by middleware and redirected to `/admin/login`.

---

## 7. Initial Administrator Account Provisioning

### Target Account
* **Email**: `mohamed13alaa12@gmail.com`
* **Role**: `admin`

### Automated Provisioning Script (`scripts/setup-admin.mjs`)
When `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured in `.env.local`:
```bash
node scripts/setup-admin.mjs
```
The script performs the following idempotent actions:
1. Queries Supabase Auth (`supabase.auth.admin.listUsers()`) to check if `mohamed13alaa12@gmail.com` exists.
2. If the user does not exist, prompts the project owner for a password via masked standard input (never written to disk or logs) and creates the user with `email_confirm: true`.
3. If the user already exists, skips creation and retains existing user credentials.
4. Synchronizes `app_metadata.role = 'admin'`.
5. Upserts a record into `public.admin_users (user_id, role)` linking the user's `auth.uid()`.
6. Executes a verification query to confirm active authorization.

### Manual SQL Provisioning (`supabase/authorize_admin.sql`)
If the project owner prefers to create the user directly in the Supabase Dashboard:
1. Open **Supabase Dashboard $\to$ Authentication $\to$ Users $\to$ Add User**.
2. Enter email: `mohamed13alaa12@gmail.com` and set a secure password.
3. Open **Supabase SQL Editor** and execute `supabase/authorize_admin.sql` (or run):
```sql
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE lower(email) = lower('mohamed13alaa12@gmail.com');

    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE id = target_user_id;
    END IF;
END $$;
```

---

## 8. Authorizing Additional Administrators

To add more administrators in the future:
1. Create the user in Supabase Auth (via Dashboard or Admin API).
2. Insert their `auth.uid()` into `public.admin_users`:
   ```sql
   INSERT INTO public.admin_users (user_id, role)
   VALUES ('<USER-UUID-FROM-AUTH.USERS>', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
3. No code changes, deployments, or frontend configuration changes are ever required.

---

## 9. Security Audit & Invariants Checklist

* [x] **Zero Hardcoded Passwords**: Passwords are handled exclusively by Supabase Auth; never placed in code, configuration, or documentation.
* [x] **Zero Hardcoded Email Authorization**: Authorization is strictly based on database role and `auth.uid()` in `public.admin_users`.
* [x] **Server-Side Enforcement**: All `/admin/*` pages and `/api/admin/*` endpoints enforce authorization server-side.
* [x] **PostgreSQL RLS Active**: Row Level Security is enabled on every public table; zero public write access exists.
* [x] **Authenticated Non-Admin Rejection**: Non-admin users are rejected from admin capabilities without infinite redirect loops.
* [x] **Identity Separation**: Admin auth identity does not overwrite public portfolio profile information (`site_settings`).
