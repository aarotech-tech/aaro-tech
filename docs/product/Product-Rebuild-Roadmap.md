# Product Rebuild Roadmap

This roadmap compares the Expected architecture (per the Master Product Specification) against the Actual implementation, detailing the prioritized path to align the platform with the enterprise vision.

## Expected vs. Actual Synthesis

| Feature / Domain | Expected | Actual | Gap / Action |
| :--- | :--- | :--- | :--- |
| **Workspace Navigation** | 5 distinct workspaces (`/sales`, `/delivery`, `/finance`, `/directory`, `/settings`) with their own isolated sidebars, governed by one `AdminShell` and a unified Topbar. | Monolithic `/crm` layout containing all routes. | **Action:** Dismantle `/crm`. Move all routes to designated workspaces. Establish `AdminShell`. |
| **Executive Dashboard** | Root `/` displays aggregated KPIs, revenue charts, and recent activity. | Root `/crm` displays the Sales Pipeline Kanban board. | **Action:** Build new root `/` Executive Dashboard. Deprecate `/crm` route. |
| **Client Portal Data** | Portal fetches `projects` and displays project progress and health. | Portal fetches `deals` and displays sales stages to the client. | **Action:** Rewrite portal data layer to query `projects`. Hide deal data entirely from clients. |
| **Conversion Engine** | `ProposalAccepted` automatically triggers `Project` and `Deposit Invoice` creation. | `ProposalAccepted` only sends a hardcoded in-app notification. | **Action:** Build Conversion Engine transaction in `events.ts` invoking Service layer. |
| **Notification System** | Dynamic role-based resolution identifying specific user IDs to alert via dedicated `/inbox`. | Hardcoded string `"internal_team"` passed to the DB. No `/inbox`. | **Action:** Build Notification Resolver. Build `/inbox` route. |
| **Finance Architecture** | `FinanceService` enforces rules. Access via Repositories only. | Raw Drizzle `db.insert` queries used directly in Server Actions. | **Action:** Build Finance bounded context. Refactor billing actions. |
| **Deliverables Queue** | Global `/delivery/reviews` queue for Operations to track all pending approvals. | Missing. Only individual deliverable details pages exist. | **Action:** Build `/delivery/reviews` global queue. |
| **Project Activation** | `InvoicePaid` automatically transitions Project to `active`. | `InvoicePaid` is not emitted on manual payment verification. | **Action:** Emit event on verification and build state transition logic. |

## Rebuild Prioritization

### 🔴 Phase 1: Architecture Correction (P0)
*Fixing catastrophic workflow failures, data boundary violations, and dismantling the monolith.*
1.  **Dismantle Monolithic CRM:** Delete the `/crm` route group. Move existing routes into `/sales`, `/delivery`, `/finance`, `/directory`, and `/settings`. Establish the `AdminShell` (Topbar, Breadcrumbs, Shell layout).
2.  **Restore Client Portal Data Integrity:** Modify the portal home page to fetch from the `projects` table instead of the `deals` table. Ensure deal stages are never exposed.
3.  **Implement the Conversion Engine:** Update the `ProposalAccepted` event handler to generate a `Project` and a Deposit `Invoice` via transactional service methods.
4.  **Refactor Finance Module:** Build `FinanceRepository` and `FinanceService`. Move all raw `db.insert` calls out of server actions.

### 🟠 Phase 2: Workflow Activation (P1)
*Connecting the fragmented pieces of the platform into cohesive end-to-end flows.*
5.  **Rebuild Executive Dashboard:** Create the root `/page.tsx` pulling cached read-models of Active Projects, Open Invoices, Pipeline Value, and Recent Activity.
6.  **Fix Notification Resolution & Inbox:** Update `notificationService` to query `organizationMembers` for dynamic role-based user resolution. Build the dedicated `/inbox` route.
7.  **Activate Project Lifecycle:** Ensure `InvoicePaid` events automatically transition `Project` status from `pending_deposit` to `active`.
8.  **Complete Client Onboarding:** Hook up the magic link and checklist UI to the portal.

### 🟡 Phase 3: Missing Capabilities & UI Standardization (P2)
*Adding the missing expected product features and enforcing UI standards.*
9.  **Global Deliverables Queue:** Build the `/delivery/reviews` master table.
10. **Lead Identity Fix:** Update `/sales/leads` to pull from `websiteLeads` instead of `organizations` to prevent entity confusion.
11. **Client Portal Approvals:** Ensure `/portal/reviews` lists all pending deliverables for the authenticated client.
12. **DataTable & UI Standardization:** Refactor all tables to use the generic `DataTable` standard. Ensure consistent Loading and Empty states platform-wide.
