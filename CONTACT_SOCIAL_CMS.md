# Contact & Social CMS Specification & Architecture (Phase 11)

## 1. Overview
The Contact & Social CMS allows an authorized administrator to manage all direct communication details, dynamic section narrative copy, and external professional social media profiles of the public Machine Learning Engineer portfolio without touching code.

All social links and contact information are unified into a single authoritative source of truth, consumed consistently across both the **Hero** and **Contact** sections, as well as any other public section rendering social or contact data.

---

## 2. Sources of Truth & Data Models

### 2.1 Contact Information (`site_settings`)
Direct contact details are stored in the singleton `site_settings` table (or development fallback singleton):
- `email`: Administrator's public direct email address (`string`).
- `phone`: Administrator's direct telephone number (`string | null`).
- `location`: Administrator's primary location / timezone / remote availability (`string | null`).

### 2.2 Dynamic Section Content (`sections` table, `slug = 'contact'`)
The copy, typography, and action buttons for the Contact section are stored in `sections.content` as `ContactContent`:
- `badge`: Category eyebrow text (e.g., `"Contact"`, `"Direct Connect"`).
- `title`: Section primary heading (e.g., `"Get In Touch"`).
- `subtitle`: Descriptive subheader text.
- `description`: Narrative contextual copy or consulting availability summary.
- `availabilityText`: Status pill (e.g., `"🟢 Available for ML Opportunities"`).
- `ctaText`: Custom call-to-action button text (e.g., `"Schedule a Technical Discussion"`).
- `ctaUrl`: Custom URL or scheduling calendar link (e.g., `"https://cal.com/mohamed-mle"`).
- `submitButtonText`: Contact form submission button label.
- `successMessage`: Acknowledgement message displayed after message submission.
- `status`: Section publication lifecycle (`'published' | 'draft' | 'archived'`).
- `enabled`: Section visibility boolean.

### 2.3 Social Links (`site_settings.social_links`)
Social links are stored centrally in `site_settings.social_links` as structured `SocialLinkItem[]` JSON. This is the **sole authoritative database store** for social channels across the entire portfolio.
```typescript
export interface SocialLinkItem {
  id: string;               // Stable unique identifier (e.g., "soc-linkedin-1", "soc-kaggle-xyz")
  platform: string;         // Canonical platform name (e.g., "LinkedIn", "GitHub", "Kaggle")
  label: string;            // Human-facing display label
  url: string;              // Valid external profile link (http/https/mailto)
  icon?: string;            // Icon identifier or brand emoji
  display_order: number;    // 1-indexed deterministic sequence
  enabled: boolean;         // Visibility toggle
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;      // ISO timestamp
  updated_at?: string;      // ISO timestamp
}
```

---

## 3. Social CRUD Lifecycle

- **Create (`POST /api/admin/social`)**:
  - Adds a new platform entry.
  - Automatically calculates `display_order = max(order) + 1` if not specified.
  - Sets initial `enabled = true` and `status = 'published'`.
- **Read (`GET /api/admin/social`)**:
  - Authenticated admin endpoint returns all social links (both enabled and disabled).
  - Normalizes legacy dictionary formats (`{ linkedin: "...", github: "..." }`) via `parseSocialLinks()`.
- **Update (`PUT /api/admin/social/[id]`)**:
  - Edits `platform`, `label`, `url`, `icon`, `display_order`, and `enabled`.
  - Atomically updates `site_settings.social_links`.
- **Delete (`DELETE /api/admin/social/[id]`)**:
  - Guarded in the UI by `SocialDeleteModal` with item name and URL confirmation.
  - Removes the item from `site_settings.social_links` without breaking other links or cascades.
- **Toggle Visibility (`PATCH /api/admin/social/[id]`)**:
  - Toggles or sets `enabled: boolean` with instantaneous feedback.

---

## 4. Social Ordering Behavior

1. **Deterministic Order**: All social links sort strictly by `display_order` ascending.
2. **Accessible Controls**: Each item card in the admin UI features accessible `Move Up` (`▲`) and `Move Down` (`▼`) buttons with:
   - Full keyboard navigation and visible focus rings.
   - Screen reader announcements via `aria-label="Move {Platform} up"` and `aria-label="Move {Platform} down"`.
   - Disabled states for the top item (`Move Up` disabled) and bottom item (`Move Down` disabled).
3. **Atomic Persistence (`POST /api/admin/social/reorder`)**:
   - Accepts `{ orderedIds: string[] }`.
   - Re-indexes each item with `display_order = index + 1`.
   - Revalidates cached public paths (`/`, `/admin/contact`, `/admin/profile`).

---

## 5. Enable / Disable & Visibility Rules

- **Inline Toggle**: Administrators can toggle any social link active or inactive directly from the list.
- **Public Visibility Filter**:
  $$\text{Visible in Public UI} \iff \text{enabled} = \text{true} \;\wedge\; \text{status} \neq \text{'archived'}$$
- **Data-Layer Sanitization**: `CmsService.getSiteSettings()` filters `social_links` at the public data layer before sending to Server Components. Disabled links are never sent over the wire and never leak into the HTML DOM or Next.js RSC payload.
- **Unified Consumption**: Both `HeroSection` and `ContactSection` receive identical CMS-sanitized social links, rendering matching platforms in the exact admin-specified sequence.

---

## 6. Optional Contact Fields & Clean Rendering (Requirement 28)

The public portfolio adheres to a strict "no fake data" rule:
- **Email**: Rendered only if configured and non-empty.
- **Phone**: Rendered **only** when non-empty. If the admin leaves phone empty, the phone row is completely omitted; no placeholder, dummy text, or broken tel link is rendered.
- **Location**: Rendered only when non-empty.
- **CTA Button**: Rendered only if both `ctaText` and `ctaUrl` are populated.
- **Availability Pill**: Rendered only if `availabilityText` is non-empty.

---

## 7. Validation Rules & Data Integrity

1. **Contact Information**:
   - `email`: Required, must pass RFC 5322 standard email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - `phone`: Optional string.
   - `location`: Optional string.
2. **Section Content**:
   - `title`: Required non-empty string.
   - `badge`: Optional string (defaults to `"Contact"`).
   - `ctaUrl`: If provided, must start with `http://`, `https://`, or `mailto:`. JavaScript pseudo-protocols (`javascript:`) and insecure schemas are strictly blocked.
   - `status`: Must be `'published'`, `'draft'`, or `'archived'`.
3. **Social Links**:
   - `platform`: Required non-empty string.
   - `url`: Required, must start with `http://`, `https://`, or `mailto:`. Script injections (`javascript:`, `data:`, `vbscript:`) are rejected with HTTP 400.

---

## 8. Authorization & Route Security

- **Server-Side Protection**: All admin pages (`/admin/contact`, `/admin/social`) and admin API endpoints (`/api/admin/contact`, `/api/admin/social`, `/api/admin/social/[id]`, `/api/admin/social/reorder`) are guarded by `AuthServerService.isAdmin()`.
- **Redirects**: Unauthenticated requests to `/admin/contact` redirect to `/admin/login`.
- **HTTP 403 Forbidden**: Unauthenticated API requests receive HTTP 403.
- **Route Redirection**: `/admin/social` immediately redirects to `/admin/contact?tab=social` for unified single-pane administration.

---

## 9. Backward Compatibility & Synchronization

- **Profile/Hero CMS Interoperability**: Updates to legacy fields in `/api/admin/profile` are synchronized with `site_settings.social_links` while preserving custom platforms (e.g., Kaggle, Hugging Face, Medium) and their custom ordering.
- **Format Normalization**: `parseSocialLinks` accepts old dictionary objects, `{ items: [] }` wrappers, or arrays, always producing clean `SocialLinkItem[]` objects.

---

## 10. Known Limitations & Strict Boundaries

1. **Phase 12 Boundaries**: Global Section Ordering (`/admin/sections`), Standalone Media Manager (`/admin/media`), Global Settings CMS, and Cinematic Visual Layers remain isolated for future phases.
2. **Message Inbox**: The contact form simulation retains current frontend submission simulation; real SMTP/backend email forwarding is reserved for Phase 13.
