# Global Sections CMS Specification & Architecture (Phase 12)

## 1. Overview
The Global Sections CMS establishes a centralized administrative control plane allowing an authorized administrator to manage the ordering, visibility, and section-level metadata of the major public portfolio sections without writing code.

The database/CMS is the single source of truth for:
1. Which public sections are enabled or disabled.
2. The deterministic sequence in which public sections are rendered.
3. Section publication lifecycle statuses (`published`, `draft`, `archived`).

The public portfolio dynamically resolves its component sequence from the CMS; hardcoded section sequence dependencies have been completely replaced.

---

## 2. Core Section Architecture & Schema

The 7 core portfolio sections are modeled in PostgreSQL `sections` table (and mirrored in `DevFallbackStore`):

| Section ID | Slug / Anchor | Canonical Type | Display Name | Role in Portfolio |
|---|---|---|---|---|
| `sec-hero` | `hero` (`#hero`) | `hero` | Hero Section | Primary viewport identity, greeting, and call to action. |
| `sec-about` | `about` (`#about`) | `about` | About Me | Professional narrative, philosophy, and engineering pillars. |
| `sec-experience` | `experience` (`#experience`) | `experience` | Experience | Chronological career history and technical achievements. |
| `sec-skills` | `skills` (`#skills`) | `skills` | Skills | Grouped technical capabilities and proficiency matrices. |
| `sec-projects` | `projects` (`#projects`) | `projects` | Featured Projects | Machine learning models, live demos, and code repositories. |
| `sec-certifications` | `certifications` (`#certifications`) | `certifications` | Certifications | Verified industry credentials and professional certificates. |
| `sec-contact` | `contact` (`#contact`) | `contact` | Get In Touch | Communication channels, direct contact, and scheduling. |

### Schema Interface
```typescript
export interface Section<T = SectionContent> {
  id: string;             // Primary key (e.g. "sec-hero", "sec-projects")
  type: SectionType;      // Component mapping key
  title: string;          // Human-readable section heading
  slug: string;           // URL anchor identifier (e.g. "about" -> #about)
  content: T;             // Section-specific JSONB payload
  display_order: number;  // 1-indexed deterministic sequence
  enabled: boolean;       // Visibility toggle flag
  status: PublishStatus;  // 'published' | 'draft' | 'archived'
  created_at: string;     // ISO timestamp
  updated_at: string;     // ISO timestamp
}
```

---

## 3. Global Section Ordering

1. **Deterministic Display Order**:
   - Order is governed by `sections.display_order` ascending.
   - The default canonical sequence is:
     1. Hero
     2. About
     3. Experience
     4. Skills
     5. Projects
     6. Certifications
     7. Contact
2. **Accessible Reordering Controls**:
   - Reordering is performed using accessible **Move Up** (`▲`) and **Move Down** (`▼`) buttons.
   - Keyboard accessible with distinct focus rings and screen-reader labels (e.g. `aria-label="Move Experience section up"`).
   - Boundaries are guarded: the top section has `Move Up` disabled; the bottom section has `Move Down` disabled.
3. **Atomic API Batch Reordering (`POST /api/admin/sections/reorder`)**:
   - Accepts `{ orderedIds: string[] }`.
   - Re-indexes each item with `display_order = index + 1`.
   - Automatically executes Next.js path cache revalidation on `/` and `/admin/sections`.

---

## 4. Enable / Disable & Visibility Rules

1. **Inline Visibility Toggle**:
   - Authorized admins can toggle any optional section directly from `/admin/sections`.
   - Disabling does **not** delete any underlying records (e.g. projects, experiences, skills remain intact).
2. **Confirmation Safeguard (Requirement 41)**:
   - When disabling a major section, `SectionDisableModal` requires explicit confirmation, explaining that the section will be hidden publicly while all data remains stored.
3. **Hero Special Protection Rule (Requirement 13)**:
   - The Hero section provides the critical viewport identity and headline greeting. Disabling it would leave a blank or broken first viewport.
   - In the Admin UI: Hero's toggle is locked with a "Core Identity" badge and explanatory tooltip.
   - In the API: `PATCH /api/admin/sections/[id]` rejects disabling Hero with HTTP 400:
     `"The Hero section is a core identity section and cannot be disabled to protect public portfolio integrity."`
4. **Core Section Protection (Requirement 19 & 20)**:
   - Core sections cannot be deleted. `DELETE /api/admin/sections/[id]` returns HTTP 400:
     `"Core portfolio sections cannot be deleted."`
5. **No CSS Hiding (Requirement 28)**:
   - Disabled sections are strictly omitted from the DOM entirely across desktop, tablet, and mobile breakpoints.

---

## 5. Enabled vs. Status Rules (Requirement 15 & 16)

- `enabled` (boolean): Controls whether the section is turned on.
- `status` (`published` | `draft` | `archived`): Controls the publication lifecycle.
- **Public Visibility Filter**:
  $$\text{Visible on Public Portfolio} \iff \text{enabled} = \text{true} \;\wedge\; \text{status} = \text{'published'}$$
- Sections marked `draft` or `archived` will not render publicly even if `enabled: true`.

---

## 6. Dynamic Section Resolution & Component Mapping (Requirement 10, 11, 51)

The centralized resolution pipeline in `src/app/page.tsx` and `src/components/dynamic-sections/SectionRenderer.tsx`:

```
[PostgreSQL / DevFallbackStore]
             │
             ▼
[CmsService.getPublishedSections()]
   - Filter: status = 'published' AND enabled = true
   - Sort: display_order ASC
             │
             ▼
[Server Component: src/app/page.tsx]
   - Passes active sections to <Navbar sections={sections} />
   - Maps sections through <SectionRenderer>
             │
             ▼
[Polymorphic Mapping in SectionRenderer]
   hero           ───► <HeroSection />
   about          ───► <AboutSection />
   experience     ───► <ExperienceSection />
   skills         ───► <SkillsSection />
   projects       ───► <ProjectsSection />
   certifications ───► <CertificationsSection />
   contact        ───► <ContactSection />
```

---

## 7. Public Navigation & Stable Anchors (Requirement 25, 26, 27)

1. **Dynamic Navigation Links**:
   - `Navbar` receives the active, published sections array.
   - If a section is disabled (e.g. `Projects`), its link is **strictly omitted** from both the desktop header and the mobile hamburger drawer.
   - Reordering sections in the CMS immediately updates the visual order of navigation links in `Navbar`.
2. **Stable Section Anchors**:
   - Stable anchor hashes (`#hero`, `#about`, `#experience`, `#skills`, `#projects`, `#certifications`, `#contact`) are preserved regardless of display order.
   - External links and direct bookmarks continue to function correctly.

---

## 8. Security & Authorization

- **Server-Side Authorization**: Protected by `AuthServerService.isAdmin()`.
- **API Guarding**:
  - `GET /api/admin/sections`: 403 Forbidden for unauthorized requests.
  - `POST /api/admin/sections`: 403 Forbidden.
  - `POST /api/admin/sections/reorder`: 403 Forbidden.
  - `PATCH /api/admin/sections/[id]`: 403 Forbidden.
  - `DELETE /api/admin/sections/[id]`: 403 Forbidden.
- **Page Guarding**: Unauthenticated visits to `/admin/sections` redirect to `/admin/login`.

---

## 9. Admin Navigation & Dashboard Integration

- **Sidebar**: The Admin Sidebar contains `Sections` (`/admin/sections`, icon: `📑`) alongside Dashboard, Profile, About, Experience, Skills, Projects, Certifications, and Contact. Future modules (Media, Settings, Publishing) remain disabled.
- **Quick Actions**: Added `Manage Section Order & Visibility` shortcut on the dashboard.
- **Dashboard Metrics**: `AdminDashboardPage` displays live section metrics reflecting total configured, enabled, and disabled sections.

---

## 10. Known Limitations & Phase 13 Boundaries

1. **Draft/Publish Workflow**: Section status supports `published`, `draft`, and `archived` states at the data layer; full visual draft preview mode, rollback, and scheduled publishing are reserved for Phase 13.
2. **Media Manager**: Uploaded assets continue to function via the existing foundation; standalone Media Library is reserved for Phase 14.
3. **Custom Section Content Builders**: Sections page edits section-level hierarchy, titles, and ordering only. Deep content editing (skills, project descriptions, achievements) remains strictly inside each dedicated module.
