# Projects CMS Specification & Architecture (Phase 9)

## 1. Overview
The Projects CMS provides an administrative interface and backend data service for managing the machine learning projects, research repositories, and interactive demos displayed on the public portfolio without requiring code modifications.

---

## 2. Project Schema & Data Model
The project architecture reuses the established Supabase schema and in-memory resilient fallback store:

| Field | Type | Description | Required |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID or stable key) | Yes |
| `title` | `string` | Human-readable title of the project/model | Yes |
| `slug` | `string` | URL-friendly unique slug identifier | Yes |
| `short_description`| `string` | Concise 1–2 sentence summary shown on project card | Yes |
| `full_description` | `string` | Detailed technical architecture and objective | No |
| `technologies` | `string[]` | List of frameworks, libraries, tools (e.g. PyTorch) | Yes |
| `thumbnail` / `thumbnail_url` | `string` | Reference URL to uploaded or configured cover media | No |
| `gallery_urls` | `string[]` | Array of additional project media references | No |
| `github_url` | `string` | Valid URL to public source code repository | No |
| `live_url` | `string` | Valid URL to interactive demo or API documentation | No |
| `featured` | `boolean` | High-priority highlight flag | No (default: false) |
| `display_order` | `number` | Deterministic ordering sequence (ascending) | Yes (default: 0) |
| `status` | `'draft' \| 'published' \| 'archived'` | Publication lifecycle state | Yes (default: 'published') |
| `enabled` | `boolean` | Inline visibility flag toggle | Yes (default: true) |
| `created_at` | `string` | ISO timestamp | Yes |
| `updated_at` | `string` | ISO timestamp | Yes |

---

## 3. Technology Relationships
Technologies can be assigned to projects using two integrated methods:
1. **Quick-Select from Skills**: The `ProjectForm` fetches existing skills from the Skills CMS (`/api/admin/skills`) and presents them as one-click badges. This ensures consistent naming across skills and projects without data duplication.
2. **Custom Technology Tags**: Administrators can type any custom tool, framework, or library (e.g., `Ray`, `Triton`, `FastAPI`) and press Enter or click "Add". Tags can be removed with a single click.

---

## 4. Media & Storage Architecture
- Binary image files are uploaded through the established `/api/admin/upload` endpoint (supporting JPEG, PNG, WebP up to 5MB).
- Uploaded media is saved to the local or cloud storage and a secure reference URL (`/uploads/...`) is assigned to `thumbnail_url`.
- URL inputs are also supported for external or CDN-hosted previews.
- Previews are rendered in real time in both the Admin form, Admin list, and public portfolio using the shared `MediaFrame` component with automated caching and error fallbacks.

---

## 5. Project CRUD Operations
- **Create**: Admins create new projects with automated slug generation from the title and duplicate slug disambiguation.
- **Read**: Admin API `/api/admin/projects` returns all projects across all states (published, draft, archived).
- **Edit**: Admins can edit any project with the unified `ProjectForm`.
- **Delete**: Safe destructive action guarded by an explicit confirmation dialog.
- **Unsaved Changes**: Guard rails prevent accidental loss of edits in the modal.

---

## 6. Ordering & Accessibility
- **Display Order**: Projects support explicit deterministic ordering using `display_order`.
- **Accessible Controls**: Each project in the Admin list features "Move Up" (`▲`) and "Move Down" (`▼`) buttons with full keyboard navigation and ARIA labels.
- **Batch Reordering**: The `/api/admin/projects/reorder` endpoint persists updated orders atomically.

---

## 7. Enable / Disable & Status Behavior
- **Inline Enable/Disable**: Admins can toggle project visibility with a single click.
- **Status Lifecycle**: Projects support `published`, `draft`, and `archived`.
- **Public Visibility Rule**: The public portfolio renders projects matching:
  $$\text{status} = \text{'published'} \quad \wedge \quad \text{enabled} \neq \text{false}$$
- Disabled, draft, or archived projects are filtered out at the CMS/Data Layer and never reach the public DOM.

---

## 8. Public Data Flow & Source of Truth
```
[Admin Projects UI (/admin/projects)]
                 │
                 ▼
[Admin API (/api/admin/projects)]
                 │
                 ▼
[AdminService & DevFallbackStore / Supabase]
                 │
                 ▼
[CMS Data Layer (CmsService.getPublishedProjects)]
                 │
                 ▼
[Server Component (src/app/page.tsx)]
                 │
                 ▼
[ProjectsSection (src/components/sections/ProjectsSection.tsx)]
```
- **Zero Synthetic Fallback**: If the database returns an empty list, the public UI gracefully displays an `EmptyState` component rather than generating fake or hardcoded mock projects.

---

## 9. Security & Authorization
- All administrative routes (`/admin/projects`) and APIs (`/api/admin/projects/*`) are protected by `AuthServerService.isAdmin()`.
- Unauthenticated requests receive HTTP 403 or redirect to `/admin/login`.
- Public visitors can only view published and enabled project records.

---

## 10. Known Limitations & Strict Boundaries
- **No Certifications CMS**: Certifications remain read-only/unimplemented until Phase 10.
- **No Contact CMS**: Contact remains unmanaged until designated phase.
- **No Global Section Ordering**: Ordering is strictly local to the Projects list.
- **No Dedicated Media Manager**: Media uploads are handled inline per project.
- **No Heavy Cinematic Layer**: Animations remain focused, smooth, and lightweight.
