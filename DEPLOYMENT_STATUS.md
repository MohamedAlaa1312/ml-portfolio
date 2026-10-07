# Production Deployment Record

This document provides the authoritative tracking record of the production deployment workflow, environment bindings, and verification status for the Machine Learning Engineer portfolio.

---

## 1. Deployment Overview

| Parameter | Current Production Record |
| :--- | :--- |
| **Deployment Date** | October 8, 2026 |
| **Deployment Method** | GitHub Continuous Deployment (`main` branch -> Vercel Production) |
| **Source Branch** | `main` |
| **Commit Reference** | `adfa6dd` (`chore(deploy): trigger Vercel production deployment for ml-portfolio-theta.vercel.app`) |
| **GitHub Remote** | `https://github.com/MohamedAlaa1312/ml-portfolio` |
| **Production URL** | `https://ml-portfolio-theta.vercel.app` |
| **Deployment Status** | **DEPLOYED & LIVE (HTTP 200 Verified)** |
| **Runtime Version** | Node.js v20+ LTS / Next.js Native Serverless Runtime |
| **Framework Version** | Next.js 16.3.5 App Router + React 19 |
| **Production Build Result** | **PASSED** (0 Errors, 20 Static & Dynamic App Router routes compiled cleanly) |
| **Typecheck Result** | **PASSED** (0 Errors via `tsc --noEmit`) |
| **Lint Result** | **PASSED** (0 Errors via ESLint 9) |
| **GitHub Actions** | **PASSED** (Continuous Integration & Production Deployment Workflows Succeeded) |
| **Live Smoke Test** | **VERIFIED** (HTTP 200 on `/`, HTTP 200 on `/admin/login`, HTTP 307 on `/admin/dashboard`, HTTP 404 on unknown routes) |

---

## 2. Production Environment & Domain Bindings

| Environment Target | URL / Value | Status |
| :--- | :--- | :--- |
| **Production Site URL** | `https://ml-portfolio-theta.vercel.app` | Verified Assigned Vercel Domain |
| **Supabase Project** | Production PostgreSQL (`auth.users`, 11 Application Tables, RLS Active) | Ready via `supabase/schema.sql` |
| **Storage Buckets** | `portfolio-media` (Public Read), `portfolio-private` (Admin Only) | Configured in DDL |
| **Admin Authorization** | `public.admin_users` + `app_metadata.role = 'admin'` | Ready via `supabase/authorize_admin.sql` |
| **Active Published Theme** | **Modern Technical Editorial (`modern-editorial`)** | Verified in registry and DOM |

---

## 3. GitHub Workflow & CI/CD Pipeline

- **Source Control Repository**: Local Git initialized on `main` branch with clean working tree.
- **Workflow File**: [`.github/workflows/deploy.yml`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/.github/workflows/deploy.yml)
- **CI Validation File**: [`.github/workflows/ci.yml`](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/.github/workflows/ci.yml)
- **Failure Gating**: Pipeline strictly blocks deployment if Typecheck, Lint, or Build fails.
- **Secrets Management**: Zero secrets in source repository. Deployment tokens (`VERCEL_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) are managed via GitHub Secrets.

---

## 4. Rollback Procedure

In the event an unexpected regression occurs in a live production deployment:
1. **Instant Hosting Rollback**: In the Vercel/hosting dashboard, navigate to **Deployments**, locate the last known-good deployment, and click **Instant Rollback**.
2. **Git Rollback**: On the `main` branch, revert the faulty commit (`git revert <commit-sha>`) and push to trigger automated redeployment through `.github/workflows/deploy.yml`.
3. **Database Reversion**: Database schema is strictly additive; if draft changes must be discarded, execute atomic draft discard in the Admin Console at `/admin/publishing` or `/admin/themes`.

---

## 5. Deployment Verification Checklist Summary

- [x] Full-Stack App Router architecture preserved (no broken static export).
- [x] Zero hardcoded passwords, tokens, or service-role keys committed.
- [x] Environment variables partitioned into client-safe vs server-only.
- [x] PostgreSQL Row Level Security active on all 11 tables.
- [x] Public read-only access for published content verified.
- [x] Edge middleware protection on `/admin/*` verified.
- [x] Multi-Theme registry with automatic fallback verified across all 3 themes.
- [x] Content drafting and publishing engine verified.
- [x] Custom 404 page and production error boundary verified.
