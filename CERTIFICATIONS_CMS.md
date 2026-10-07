# Certifications CMS Specification & Architecture (Phase 10)

## 1. Overview
The Certifications CMS allows an authorized administrator to manage industry credentials, verified specializations, and professional certificates displayed on the public portfolio without requiring code modifications.

---

## 2. Certification Schema & Data Model
The implementation reuses the established Supabase database schema and resilient in-memory development fallback store:

| Field | Type | Description | Required |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID or stable key) | Yes |
| `title` | `string` | Human-readable name/title of the certification | Yes |
| `issuer` | `string` | Issuing organization (e.g. Coursera, DeepLearning.AI) | Yes |
| `issue_date` | `string` | Date of issuance (`YYYY-MM-DD` or date string) | Yes |
| `expiration_date` | `string \| null` | Optional expiration date | No |
| `credential_id` | `string \| null` | Verification or credential license identifier | No |
| `credential_url` | `string \| null` | Valid URL to verify the credential online | No |
| `image` / `image_url` | `string \| null` | Certificate badge or document image reference | No |
| `description` | `string` | Summary of competencies and topics covered | No (default: '') |
| `display_order` | `number` | Deterministic ordering sequence (ascending) | Yes (default: 0) |
| `status` | `'draft' \| 'published' \| 'archived'` | Publication lifecycle status | Yes (default: 'published') |
| `enabled` | `boolean` | Inline visibility flag | Yes (default: true) |
| `created_at` | `string` | ISO timestamp | Yes |
| `updated_at` | `string` | ISO timestamp | Yes |

---

## 3. Date & Credential Handling
- **Issue Date**: Mandatory field indicating when the certification was earned.
- **Expiration Date**: Optional field. If provided, validation ensures that the expiration date cannot precede the issue date.
- **Credential ID**: Plain-text optional field; only rendered in public cards when populated.
- **Verification URL**: Validated external URL (`http://`, `https://`, or `/`). The public action button (`Verify Credential ↗`) is strictly rendered only when a valid verification URL exists.

---

## 4. Media & Storage Architecture
- Certificate badges and images are uploaded via the established `/api/admin/upload` endpoint (supporting JPEG, PNG, WebP up to 5MB).
- Binary files remain in configured storage; references are stored in `image_url`.
- Real-time preview is rendered with `MediaFrame` (1:1 aspect ratio) with automatic fallback to recognized issuer icons (`Coursera`, `DeepLearning.AI`, `Udemy`, `DataCamp`, `Microsoft`, `AWS`, `Google Cloud`, `Stanford`, `NVIDIA`, `Kaggle`, etc.).

---

## 5. Certification CRUD Operations
- **Create**: Authenticated `POST /api/admin/certifications` with required field validation, date consistency checks, and URL validation.
- **Read**: `GET /api/admin/certifications` returns all certifications across all states for admin management.
- **Edit**: `PUT /api/admin/certifications/[id]` updates attributes and revalidates public routes.
- **Delete**: Guarded by an explicit confirmation dialog in the UI. `DELETE /api/admin/certifications/[id]` permanently removes the entry without destructive cascades.
- **Unsaved Changes**: Guard rails prevent accidental loss of edits in the modal form.

---

## 6. Ordering & Accessibility
- **Display Order**: Controlled by `display_order`.
- **Accessible Controls**: Each item in the admin list features accessible `Move Up` (`▲`) and `Move Down` (`▼`) buttons with full keyboard navigation and screen-reader labels.
- **Batch Reordering**: `POST /api/admin/certifications/reorder` atomically updates sequence numbers.

---

## 7. Enable / Disable & Status Behavior
- **Inline Enable/Disable**: Admin toggle button allows immediate enabling or disabling of any certification without opening the edit form.
- **Status Lifecycle**: Supports `published`, `draft`, and `archived`.
- **Public Visibility Filter**:
  $$\text{status} = \text{'published'} \quad \wedge \quad \text{enabled} \neq \text{false}$$
- Disabled, draft, or archived credentials are excluded at the CMS/Data Layer and never reach the public DOM.

---

## 8. Public Data Flow & Source of Truth
```
[Admin Certifications UI (/admin/certifications)]
                      │
                      ▼
[Admin API (/api/admin/certifications)]
                      │
                      ▼
[AdminService & DevFallbackStore / Supabase]
                      │
                      ▼
[CMS Data Layer (CmsService.getPublishedCertifications)]
                      │
                      ▼
[Server Component (src/app/page.tsx)]
                      │
                      ▼
[CertificationsSection (src/components/sections/CertificationsSection.tsx)]
```
- **Zero Hardcoded Data**: Removed all static `defaultCertifications`. If the database returns 0 certifications, the public UI gracefully displays an `EmptyState` component.

---

## 9. Security & Authorization
- Administrative page `/admin/certifications` and APIs (`/api/admin/certifications/*`) are protected by `AuthServerService.isAdmin()`.
- Unauthenticated requests receive HTTP 403 or redirect to `/admin/login`.
- Public visitors can only view published and enabled certifications.

---

## 10. Known Limitations & Strict Boundaries
- **No Contact CMS**: Contact remains unmanaged until designated phase.
- **No Dedicated Media Manager**: Media uploads are handled inline per certification.
- **No Settings CMS**: Settings management is deferred to future phases.
- **No Global Section Ordering**: Ordering is strictly local to Certifications.
- **No Heavy Cinematic Layer**: Portfolio visual style remains professional, clean, and credibility-focused.
