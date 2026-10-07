# Production Deployment Guide

This guide details the procedures, architecture specifications, and security practices required to deploy the Machine Learning Engineer Portfolio to production.

---

## 1. Prerequisites

- A GitHub account for source control repository hosting
- Node.js runtime environment (v20.x or v22.x LTS)
- Package manager: `npm` (v10+)
- A Supabase production project ([https://supabase.com](https://supabase.com))
- A production hosting provider supporting Next.js App Router (e.g., Vercel, Netlify, AWS Amplify, or a Docker/Node container)
- A custom domain or subdomain (e.g., `https://mohamedkhaled.dev`)

---

## 2. Runtime Version & Package Manager

- **Node.js**: `20.x` or `22.x` LTS (Specified in `.nvmrc`)
- **Package Manager**: `npm` with lockfile verification (`npm ci`)
- **Framework**: Next.js 16 (App Router)

---

## 3. Environment Variables Architecture

Environment variables are partitioned into **Public Client-Side** variables and **Private Server-Only** secrets.

### Client-Safe Variables (Exposed to Browser Bundle)
| Variable Name | Required | Example / Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key (protected by RLS) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical production URL (e.g. `https://mohamedkhaled.dev`) |

### Server-Only Secrets (NEVER Exposed to Client)
| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional / Admin | Supabase service-role key for backend admin provisioning |
| `ADMIN_EMAIL` | Optional | Initial email used by `scripts/setup-admin.mjs` |

> **IMPORTANT**: The Administrator password is NEVER stored in environment variables, configuration files, or database records. It is handled exclusively by Supabase Auth (`auth.users`).

---

## 4. Supabase Production Setup

### 4.1 Schema Initialization
Execute the schema migration in the Supabase SQL Editor:
1. Open the Supabase Project Dashboard -> **SQL Editor**.
2. Run the complete schema script: [`supabase/schema.sql`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/supabase/schema.sql).
3. Verify that all tables, enums, triggers, and functions are created.

### 4.2 Storage Buckets Configuration
Verify the presence and policies of the storage buckets created by `schema.sql`:
- **`portfolio-media`**: Public bucket for published images and static assets.
  - Policy: Public Read (`SELECT`) for all users.
  - Policy: Write/Update/Delete restricted to authenticated Admins (`public.is_admin()`).
- **`portfolio-private`**: Private bucket for draft attachments and administrative assets.
  - Policy: Read/Write/Delete restricted strictly to authenticated Admins (`public.is_admin()`).

### 4.3 Administrator Authorization
1. Create your administrator user in Supabase Dashboard -> **Authentication** -> **Users** -> **Add User**.
2. Run the authorization script in the SQL Editor: [`supabase/authorize_admin.sql`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/supabase/authorize_admin.sql), ensuring the target email matches your created user.
3. This adds the user record to `public.admin_users` and synchronizes `app_metadata.role = 'admin'`.

---

## 5. Authentication & Redirect Configuration

In your Supabase Project Dashboard -> **Authentication** -> **URL Configuration**:
1. **Site URL**: Set to your canonical production URL:
   ```
   https://mohamedkhaled.dev
   ```
2. **Redirect URLs**: Add your production domain and local fallback:
   ```
   https://mohamedkhaled.dev/**
   https://mohamedkhaled.dev/admin/login
   https://mohamedkhaled.dev/admin/dashboard
   http://localhost:3000/**
   ```

---

## 6. Build & Deployment Commands

| Environment | Command | Description |
| :--- | :--- | :--- |
| **Typecheck** | `npm run typecheck` | Validates TypeScript types across all components |
| **Lint** | `npm run lint` | Ensures code quality and Next.js invariants |
| **Build** | `npm run build` | Compiles optimized Next.js production bundle |
| **Start** | `npm run start` | Launches production server on configured port |

---

## 7. GitHub Repository & CI Configuration

1. Initialize or maintain the Git repository with the clean `.gitignore` provided.
2. Ensure `.github/workflows/ci.yml` is enabled on your repository to automatically run:
   - Dependency installation (`npm ci`)
   - Typechecking (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Production bundle compilation (`npm run build`)
3. Never store secrets in GitHub Actions workflows or repository secrets unless explicitly needed for automated deployment.

---

## 8. Post-Deployment Verification (Smoke Tests)

After deploying to production hosting:
1. **Public Portfolio (`/`)**:
   - Verify page renders correctly with active published theme.
   - Verify all enabled sections load (Hero, About, Experience, Skills, Projects, Certifications, Contact).
   - Test responsive layout on mobile, tablet, and desktop viewports.
2. **Admin Authentication (`/admin/login`)**:
   - Navigate to `/admin/login`.
   - Log in with provisioned Administrator credentials.
   - Confirm immediate redirect to `/admin/dashboard`.
3. **Admin Modules**:
   - Verify access to `/admin/profile`, `/admin/projects`, `/admin/themes`, etc.
   - Test creating a draft change and previewing it in `/admin/preview`.
   - Test publishing a draft change and confirming it reflects on the public homepage.
4. **Security & Session**:
   - Test `/api/auth/logout` and ensure session cookies are cleared.
   - Attempt accessing `/admin/dashboard` in an incognito window and verify redirect to `/admin/login`.
