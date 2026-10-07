# Production Machine Learning Engineer Portfolio & Headless CMS

An enterprise-grade, high-performance personal portfolio and content management system designed specifically for a professional **Machine Learning Engineer**. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS, Storage)**.

---

## 1. Project Overview

This application serves as both a high-impact public portfolio showcasing machine learning systems, architectures, research, and verified credentials, and a secure, headless Content Management System (CMS) enabling full editorial control over portfolio content, layout ordering, media assets, and visual themes.

### Key Highlights
- **Dynamic Multi-Theme Architecture**: Switch seamlessly between three distinct high-fidelity visual design systems (`modern-editorial`, `precision-dark`, and `structured-monochrome`).
- **Full Headless CMS**: Complete administrative modules for Profile, About, Experience, Skills, Projects, Certifications, Contact, Social, Sections, Media, and Themes.
- **Draft / Preview / Publish Engine**: Safe drafting and side-by-side preview mode before atomic publishing to the public portfolio.
- **Enterprise Security**: Row Level Security (RLS) on all database tables, secure Supabase Auth integration, RBAC admin authorization, and zero secret leakage.
- **Zero-Setup Local Dev Fallback**: Built-in in-memory fallback store (`DevFallbackStore`) allows immediate local development and UI testing even before Supabase is connected.

---

## 2. Technologies & Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 4 & Vanilla CSS custom design tokens
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Security & Authorization**: PostgreSQL Row Level Security (RLS) with Security Definer functions (`public.is_admin()`) and HTTP-only session cookies
- **Media Storage**: Supabase Storage (`portfolio-media`, `portfolio-private`) with local filesystem dev fallbacks
- **CI/CD**: GitHub Actions workflow for linting, typechecking, and production builds

---

## 3. Architecture Overview

```
src/
├── app/                      # Next.js App Router
│   ├── (public)              # Public portfolio homepage (/)
│   ├── admin/                # Protected Admin Console & CMS modules
│   │   ├── dashboard/        # Operational overview & analytics
│   │   ├── profile/          # Hero & Personal Identity CMS
│   │   ├── about/            # Biography & Philosophy CMS
│   │   ├── experience/       # Career timeline & achievements CMS
│   │   ├── skills/           # Technical taxonomy & categories CMS
│   │   ├── projects/         # Applied ML systems & case studies CMS
│   │   ├── certifications/   # Accreditations & verification links CMS
│   │   ├── contact/          # Inquiries & social channels CMS
│   │   ├── sections/         # Global section ordering & toggle CMS
│   │   ├── media/            # Digital Asset Manager
│   │   ├── settings/         # SEO, system preferences & branding CMS
│   │   └── themes/           # Theme manager & live preview CMS
│   ├── api/                  # Secure RESTful Route Handlers
│   ├── not-found.tsx         # Branded 404 handler
│   └── error.tsx             # Production error boundary
├── components/               # UI components, layout docks & admin forms
├── lib/                      # Supabase clients & store implementations
├── services/                 # Business logic, CMS services & Auth
└── themes/                   # Multi-theme registry, contracts & engines
```

---

## 4. Multi-Theme System

The portfolio features a pluggable, isolated Multi-Theme architecture adhering to a strict design contract:
1. **Modern Technical Editorial (`modern-editorial`)**: Warm, balanced editorial aesthetic featuring warm obsidian tones (`#121417`), burnt amber accents (`#C25E34`), and structured serif/mono typography.
2. **Precision Dark Portfolio (`precision-dark`)**: Technical, high-density aerospace aesthetic with pitch-black backgrounds (`#080A0E`), amber metrics (`#F59E0B`), and cybernetic grid detailing.
3. **Structured Monochrome (`structured-monochrome`)**: Brutalist, high-contrast black-and-white minimalist architecture (`#050505` / `#FAFAFA`) emphasizing typography, geometry, and high-contrast photography.

All themes resolve dynamically via CMS configuration with automatic registry fallbacks and draft preview support (`/admin/preview?theme=<slug>`).

---

## 5. Local Setup & Quickstart

### Prerequisites
- Node.js 20 LTS or higher (`.nvmrc` included)
- npm 10+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ml-portfolio

# Install dependencies (lockfile preserved)
npm ci
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local
```

Configure your `.env.local` credentials. If Supabase is unconfigured, the application runs automatically in zero-setup Local Development mode with the `DevFallbackStore`.

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public portfolio.

---

## 6. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with hot reload |
| `npm run typecheck` | Executes TypeScript typecheck (`tsc --noEmit`) with strict checks |
| `npm run lint` | Runs ESLint 9 across all components, routes, and services |
| `npm run build` | Compiles optimized production bundle |
| `npm run start` | Starts Next.js production server locally |

---

## 7. Admin Console & Authentication

1. Navigate to `/admin/login`.
2. For production environments, admin accounts are provisioned via `scripts/setup-admin.mjs` or directly via Supabase Auth.
3. Access to all `/admin/*` routes is enforced at the Edge by `src/middleware.ts` and validated via PostgreSQL Row Level Security.
4. Passwords and credentials are never stored in source code, configuration files, or database tables.

---

## 8. Security Invariants

- **Row Level Security (RLS)**: Public visitors have strictly read-only access to published content (`status = 'published'`). All mutation operations require authenticated administrator privileges verified by `public.is_admin()`.
- **Zero Secret Leakage**: Service-role keys, database passwords, and auth tokens are restricted to server-side route handlers. Zero sensitive environment variables are bundled into the client.
- **Redirect Validation**: All internal authentication redirects are strictly validated to prevent Open Redirect vulnerabilities.

---

## 9. Deployment Preparation

Detailed production hosting, Supabase provisioning, and domain configuration instructions are provided in [DEPLOYMENT.md](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/DEPLOYMENT.md) and [PRODUCTION_CHECKLIST.md](file:///f:/internships%20and%20courses/portfolio%202/ml-portfolio/PRODUCTION_CHECKLIST.md).
