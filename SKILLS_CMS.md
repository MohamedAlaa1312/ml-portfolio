# Skills CMS Architecture & User Guide (Phase 8)

The **Skills CMS** enables authorized administrators to manage technical proficiencies, skills categories, display ordering, and visibility without writing code.

---

## 1. Overview & Data Architecture

The Skills system manages two interconnected entities:

1. **Skills**:
   - `id`: Unique identifier (UUID or stable key).
   - `name`: Technical skill title (e.g., `PyTorch`, `FastAPI`, `Kubernetes`).
   - `category`: Category grouping string.
   - `proficiency`: Optional proficiency score between `0` and `100`.
   - `icon`: Optional emoji or symbol identifier (e.g., `⚡`, `🧠`).
   - `display_order`: Display sequence integer within the category.
   - `enabled`: Boolean toggle indicating whether the skill is published to the public portfolio.
   - `created_at` / `updated_at`: ISO timestamp metadata.

2. **Skill Categories**:
   - `id`: Unique identifier.
   - `name`: Category name (e.g., `Machine Learning`, `Programming`, `Data Science`).
   - `description`: Optional explanatory subtitle.
   - `icon`: Category emoji or symbol.
   - `display_order`: Category sequence on the public portfolio.
   - `enabled`: Boolean toggle. Disabling a category hides all of its assigned skills from the public portfolio.

---

## 2. API Endpoints

All endpoints are strictly guarded by `AuthServerService.isAdmin()`. Any unauthenticated or unauthorized request returns `403 Forbidden`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/skills` | List all skills and categories. |
| `POST` | `/api/admin/skills` | Create a new skill (with name, category, proficiency, order, enabled). |
| `GET` | `/api/admin/skills/[id]` | Retrieve a single skill by ID. |
| `PUT` | `/api/admin/skills/[id]` | Update an existing skill. |
| `DELETE` | `/api/admin/skills/[id]` | Permanently delete a skill. |
| `POST` | `/api/admin/skills/reorder` | Reorder skills by an array of IDs. |
| `GET` | `/api/admin/skills/categories` | List all skill categories. |
| `POST` | `/api/admin/skills/categories` | Create a new skill category (with duplicate name validation). |
| `PUT` | `/api/admin/skills/categories` | Update a skill category. **Cascades renaming to all assigned skills.** |
| `DELETE` | `/api/admin/skills/categories` | Delete a skill category with **safe deletion protection** against orphaned skills. |
| `POST` | `/api/admin/skills/categories/reorder` | Reorder categories by an array of IDs. |

---

## 3. Safety Guarantees

1. **Safe Category Deletion**:
   - When attempting to delete a category that currently has skills assigned, the system rejects the operation with `400 Bad Request` and returns `{ canForce: true, skillCount: N }`.
   - The Admin UI displays a warning modal prompting the user to either cancel and reassign the skills, or explicitly confirm force deletion.

2. **Category Renaming Cascade**:
   - Updating a category name automatically cascades to all existing skills assigned to the old name, ensuring no broken references or orphaned skills.

3. **Zero Synthetic Skills**:
   - If the database contains zero skills or if all skills/categories are disabled, the public page renders a clean `EmptyState` component. It does NOT generate or inject mock/fake skills.

4. **Defense-in-Depth Security**:
   - Server-side redirect in `/admin/skills/page.tsx` prevents unauthorized page rendering.
   - API routes reject unauthenticated requests with `403 Forbidden`.
   - Proxy/middleware ensures protected admin route redirection.

---

## 4. Admin UI Features

- **Split View / Tabs**:
  - **Skills Tab**: Displays skills grouped by category, with search by name/category, category filtering, proficiency indicators, quick inline enable/disable toggle, Move Up/Down reordering, Edit modal, and Delete confirmation.
  - **Categories Tab**: Displays all categories with assigned skill counts, active badges, Move Up/Down reordering, Edit modal, and safe deletion confirmation.
- **Real-Time Synchronized Public Portfolio**:
  - Revalidation calls ensure changes made in Admin are instantly reflected on the public portfolio (`/`).
