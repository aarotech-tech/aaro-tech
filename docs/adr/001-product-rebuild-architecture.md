# ADR 001: Product Rebuild & Monolith Dismantling

**Status:** Approved
**Date:** 2026-07-21
**Context:** The current application structure evolved into a monolithic `/crm` route group that violates the Enterprise Architecture Implementation Guide (EAIG) and Master Product Specification (MPS). Distinct business domains (Sales, Delivery, Finance) are mixed into a single navigation shell, creating data boundary risks, duplicate routes, and a fragmented user experience.

## Decision
We will dismantle the `/crm` monolithic route group and restructure the platform around strict bounded contexts governed by a unified `AdminShell`.

### Target Workspace Architecture
The `(admin)` route group will house the following distinct workspaces, each with a focused sidebar and responsibility:
*   `/sales`: Pipeline, Leads, Proposals.
*   `/delivery`: Projects, Tasks, Deliverables (Reviews).
*   `/finance`: Invoices, Payments.
*   `/directory`: Organizations, Contacts.
*   `/settings`: Agency configuration.
*   `/inbox`: Global notification center.
*   `/automations`: Background job management.

All workspaces will be wrapped by `AdminShell`, which manages the persistent global topbar (search, workspace switcher, user menu).

### Migration Strategy (Incremental & Safe)
1.  **Construct `AdminShell`:** Build the new global shell and workspace switching logic without affecting existing routes initially.
2.  **Migrate Routes:** Move routes out of `/crm` into their target top-level directories (e.g., move `/crm/billing` to `/finance/invoices`).
3.  **Deduplicate:** Resolve instances where functionality exists in two places (e.g., Kanban boards in `/crm` and `/sales/pipeline`). The new bounded context route becomes the single source of truth.
4.  **Backend Refactoring:** Concurrently refactor business logic to adhere to the `Repository -> Service -> Action` pattern (specifically targeting the Finance module).

### Route Handling & Backward Compatibility
*   **Redirects:** `next.config.ts` or `middleware.ts` will be updated to automatically redirect legacy `/crm/*` links to their new destinations (e.g., `/crm/billing` -> `/finance/invoices`). This ensures deep links from emails or bookmarks do not break.
*   **Deprecation:** The `/crm` folder will be completely removed once the migration is complete and redirects are established.

### Rollback Considerations
*   Since migration happens incrementally and heavily leverages Next.js file-system routing, if a specific migration step fails, that specific route can be reverted via git without bringing down the entire shell.
*   Legacy code will remain in version control history if complete rollback is required. No database schema changes are strictly necessary for the route migration, minimizing data rollback risks.

## Consequences
*   **Positive:** Enforces domain boundaries, reduces cognitive load for users (Finance only sees Finance), and sets a scalable foundation for future enterprise features.
*   **Negative:** High initial refactoring cost. Potential for temporary broken links if redirects are not comprehensively mapped.
