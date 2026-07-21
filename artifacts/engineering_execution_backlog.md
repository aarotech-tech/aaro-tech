# Aarotech Enterprise Platform — Engineering Execution Backlog

**Role:** Engineering Manager / Technical Program Manager
**Status:** Implementation-Ready Backlog
**Date:** 2026-07-21
**Source Documents:** Master Product Specification (MPS), Rebuild Roadmap, BCDG, EAIG

---

## SECTION 1 — Execution Strategy

### Implementation Philosophy
We follow a **"Core-to-Shell"** rebuild methodology. We do not build user interfaces until the underlying data structures, APIs, and domain events are stable. The platform's value is in its automated workflows; therefore, backend conversion engines and architectural boundaries must be fixed before cosmetic UI restructuring.

### Dependency Strategy
1. **Database first:** `notifications` table migration.
2. **Architecture second:** `Finance` module refactor + `Conversion Engine` event handlers.
3. **Containers third:** `Navigation Shell` layouts (so pages have a home).
4. **Pages fourth:** `Dashboard`, `Directory`, `Sales`, `Delivery`, `Finance`.
5. **Polishing fifth:** Empty states, loading states, settings.
6. **Testing last:** Playwright E2E suites verifying the end-to-end flows.

### Risk Reduction
- **Feature Flagging:** Avoided in V1 rebuild to reduce complexity. Instead, we use aggressive git branching (e.g., `feature/finance-refactor`) merged into a `develop` branch for staging, only pushing to `main` when the full workflow (Sales → Delivery) is intact.
- **Rollback Safety:** All DB migrations must have a tested `down()` script. No destructive migrations (dropping tables) are permitted during the rebuild.

### Parallel Development Opportunities
Once Sprints 0 and 1 (Core Architecture) are complete, frontend engineers can work in parallel:
- Dev A: Sales & Directory Workspaces
- Dev B: Delivery Workspace & Client Portal
- Dev C: Finance Workspace & Dashboard

---

## SECTION 2 — Epic Breakdown

**EPIC 1: Architecture Stabilization (P0 Blockers)**
Fixing the core boundaries, the missing finance module, and the broken conversion engine.

**EPIC 2: Navigation & Platform Shell**
Implementing the workspace-based navigation structure, topbar, and Cmd+K.

**EPIC 3: Directory & Sales Workspaces**
Building the master org directory and cleaning up the lead-to-proposal pipeline.

**EPIC 4: Delivery Workspace**
Closing the gaps in project management, global task board, and review queue.

**EPIC 5: Finance Workspace**
Building the billing UIs and payment ledger on top of the stabilized Finance module.

**EPIC 6: Client Portal & Notifications**
Fixing portal data leaks, onboarding checklists, and delivering real user notifications.

**EPIC 7: Dashboard & Settings**
Executive KPI aggregations, revenue charts, and agency configuration.

**EPIC 8: UX Standardization**
Applying loading skeletons, empty states, toasts, and breadcrumbs universally.

**EPIC 9: Testing & Automation**
E2E testing the golden path, setting up CI/CD, resolving N+1 queries.

**EPIC 10: Production Hardening**
Security audits, Stripe webhooks, rate limiting, and go-live prep.

---

## SECTION 3 — Sprint Planning

### Sprint 0: Foundation Stabilization (3 days)
**Sprint Goal:** Resolve critical P0 data boundary and architectural violations.
**Dependencies:** None.
**Tasks:**
- TSK-001: Create `notifications` table migration.
- TSK-002: Scaffold `src/modules/finance/` (repositories, services).
- TSK-003: Refactor `billing.ts` to call FinanceService.
- TSK-004: Fix `portal/page.tsx` query to fetch projects instead of deals.
**Deliverables:** Stabilized DB schema, isolated Finance domain, secure Client Portal data.
**Definition of Done:** All tests pass, portal UI verified with dummy project.

### Sprint 1: The Conversion Engine (2 days)
**Sprint Goal:** Automate the handoff from Sales to Delivery to Finance.
**Dependencies:** Sprint 0.
**Tasks:**
- TSK-101: Implement `ProposalAccepted` handler (creates project + deposit invoice).
- TSK-102: Implement `InvoicePaid` handler (activates project).
- TSK-103: Implement Stripe webhook `/api/webhooks/stripe`.
**Deliverables:** End-to-end business automation.
**Definition of Done:** Signing a proposal automatically creates a project and invoice in a single DB transaction.

### Sprint 2: Navigation Shell (2 days)
**Sprint Goal:** Rebuild the global application layout to support isolated workspaces.
**Dependencies:** Sprint 1.
**Tasks:**
- TSK-201: Create global topbar (search, bell, avatar, workspace switcher).
- TSK-202: Create isolated layout files for `(admin)/sales`, `(admin)/delivery`, etc.
- TSK-203: Add redirect stubs for deprecated `/crm/*` routes.
**Deliverables:** Functioning multi-workspace UI skeleton.
**Definition of Done:** User can switch workspaces; sidebar completely refreshes; URL updates accurately.

### Sprint 3: Directory & Sales (3 days)
**Sprint Goal:** Establish the source of truth for Organizations and clean up pre-sales.
**Dependencies:** Sprint 2.
**Tasks:**
- TSK-301: Build `/directory/organizations` and profile view.
- TSK-302: Fix `/sales/leads` query to use `websiteLeads`.
- TSK-303: Move `/crm/proposals` into `/sales/proposals`.
**Deliverables:** Clean CRM pipeline, functional master directory.
**Definition of Done:** Lead promotion creates Org/Deal correctly; no CRM route duplicates remain.

### Sprint 4: Delivery & Finance UI (3 days)
**Sprint Goal:** Build operational views for PMs and Finance Officers.
**Dependencies:** Sprint 3 (for org links).
**Tasks:**
- TSK-401: Build `/delivery/reviews` global queue.
- TSK-402: Build `TaskDrawer` component.
- TSK-403: Build `/finance/invoices` and `/finance/payments` pages.
**Deliverables:** Fully functional operational workspaces.
**Definition of Done:** PM can see all pending deliverables globally; Finance can record a payment via UI.

### Sprint 5: Portal, Notifications & Dash (3 days)
**Sprint Goal:** Finish external UI, central inbox, and executive view.
**Dependencies:** Sprints 1, 4.
**Tasks:**
- TSK-501: Build `/portal/reviews` and onboarding checklist.
- TSK-502: Build `/inbox` and wire `notificationService` to real user IDs.
- TSK-503: Build Executive Dashboard `/` (KPIs, Charts).
**Deliverables:** Client approval flow, internal alerts, leadership view.
**Definition of Done:** Client approves deliverable -> Internal PM gets real-time notification -> Dashboard updates.

### Sprint 6: Hardening & Testing (4 days)
**Sprint Goal:** Prepare platform for production deployment.
**Dependencies:** All previous sprints.
**Tasks:**
- TSK-601: Add `loading.tsx` and empty states universally.
- TSK-602: E2E Playwright golden path tests.
- TSK-603: N+1 query audit and caching setup.
- TSK-604: Security/RBAC audit.
**Deliverables:** A fast, secure, heavily tested product.
**Definition of Done:** 100% E2E pass rate, sub-second load times on dashboard, zero security leaks.

---

## SECTION 4 — User Stories

*(Sample of critical stories)*

**US-01: Automated Project Kickoff**
- **As a** Sales Rep, **I want** a signed proposal to automatically create a delivery project, **so that** I don't have to manually notify the PM and copy data over.
- **Acceptance Criteria:**
  - When Proposal status updates to `accepted`.
  - A new Project is created under the parent Organization.
  - Project status is `pending_deposit`.
  - PM receives in-app notification.
- **Priority:** P0 | **Dependencies:** None | **Complexity:** 5 points

**US-02: Client Portal Data Isolation**
- **As a** Client, **I want** to log in and see my project progress, **so that** I know what work is being done.
- **Acceptance Criteria:**
  - Portal home displays data from `projects` table matching `user.organizationId`.
  - Portal does NOT display internal `deals` data.
- **Priority:** P0 | **Dependencies:** None | **Complexity:** 2 points

**US-03: Global Deliverable Review**
- **As a** Project Manager, **I want** to see all deliverables awaiting client review across all my projects in one screen, **so that** I can chase approvals efficiently.
- **Acceptance Criteria:**
  - `/delivery/reviews` page exists.
  - Table lists all deliverables with status `in_review`.
  - Links directly to project detail.
- **Priority:** P1 | **Dependencies:** Navigation Shell | **Complexity:** 3 points

---

## SECTION 5 — Engineering Tasks

### TSK-101: Implement Conversion Engine (ProposalAccepted)
- **Description:** Wire the `ProposalAccepted` event to create a Project and Invoice in a DB transaction.
- **Files Expected:** `src/modules/core/events.ts`, `src/modules/delivery/services.ts`, `src/modules/finance/services.ts`.
- **Database Changes:** None.
- **API Changes:** None.
- **UI Changes:** None.
- **Tests Required:** Unit test for event handler; Integration test mocking DB transaction.
- **Acceptance Criteria:** Project and Invoice appear in DB when `emitDomainEvent({ type: 'ProposalAccepted' })` is fired.
- **Definition of Done:** Code merged, tests pass.

### TSK-202: Workspace Layouts Implementation
- **Description:** Create Next.js route groups and layouts for the 5 workspaces.
- **Files Expected:** `src/app/(admin)/sales/layout.tsx`, `delivery/layout.tsx`, `finance/layout.tsx`, `directory/layout.tsx`, `settings/layout.tsx`, `src/components/layout/Sidebar.tsx`.
- **Database Changes:** None.
- **UI Changes:** Sidebar renders different links based on route context.
- **Tests Required:** E2E navigation check.
- **Acceptance Criteria:** Navigating from `/sales/pipeline` to `/delivery/projects` replaces the sidebar entirely.

### TSK-302: Fix Sales Leads Query
- **Description:** Repoint `/sales/leads` away from the `organizations` table to the `websiteLeads` table.
- **Files Expected:** `src/app/(admin)/sales/leads/page.tsx`, `src/app/(admin)/sales/leads/LeadsTable.tsx`.
- **Database Changes:** None.
- **UI Changes:** Update table columns to match `websiteLeads` schema. Add "Qualify" button.
- **Acceptance Criteria:** Table lists website leads. Clicking Qualify executes `qualifyLead` server action.

---

## SECTION 6 — Dependency Graph

```mermaid
graph TD
    A[TSK-001: Notifications DB Migration] --> B[TSK-502: Inbox & Notifications System]
    C[TSK-002: Finance Module Scaffold] --> D[TSK-003: Refactor billing.ts]
    C --> E[TSK-101: Conversion Engine (ProposalAccepted)]
    E --> F[TSK-102: Conversion Engine (InvoicePaid)]
    
    G[TSK-202: Workspace Layouts] --> H[TSK-301: Directory Workspace Pages]
    G --> I[TSK-401: Delivery Workspace Pages]
    G --> J[TSK-403: Finance Workspace Pages]
    
    H --> K[TSK-602: E2E Playwright Tests]
    I --> K
    J --> K
    
    L[TSK-004: Fix Portal Data Leak] --> M[TSK-501: Portal Reviews & Onboarding]
    M --> K
```
**Critical Path:** Finance Module Scaffold → Conversion Engine → Workspace Layouts → UI Pages → E2E Testing.

---

## SECTION 7 — Architecture Tasks

1. **Finance Repository Refactor:** Migrate all raw Drizzle calls out of `app/actions/billing.ts` into `src/modules/finance/repositories.ts`.
2. **Notification Resolver:** Build utility `resolveRolesToUsers(roles[], orgId)` to fetch real Clerk user IDs before inserting into `notifications` table.
3. **Transaction Contexts:** Ensure the Conversion Engine wraps `createProject` and `createInvoice` in a single Drizzle transaction object.
4. **Caching Layer:** Add Next.js `unstable_cache` or Redis for `/` dashboard aggregation queries (TTL: 5 minutes) to prevent DB thrashing.

---

## SECTION 8 — Testing Tasks

1. **Unit Tests:** `FinanceService` business rules (e.g., cannot void a paid invoice).
2. **Integration Tests:** The Event Bus orchestration. Verify that emitting `ProposalAccepted` executes the three required service calls in order.
3. **E2E Golden Path (Playwright):**
   - Script 1: Lead form submit -> Internal User Qualifies -> Drag Deal to Won.
   - Script 2: PM uploads Deliverable -> Client logs in to Portal -> Client clicks Approve.
4. **Security Tests:** IDOR test - script attempts to fetch `/finance/invoices/[id]` using an auth token from a different organization.

---

## SECTION 9 — Production Tasks

1. **Environment:** Verify Neon Prod DB, Clerk Prod Instance, UploadThing Prod Keys, Stripe Live Keys.
2. **Webhooks:** Register Stripe live webhook URL in Stripe dashboard and add endpoint secret to Vercel env vars.
3. **Logging:** Integrate Sentry for edge/server error catching.
4. **Migrations:** Run `drizzle-kit generate` and `drizzle-kit push` (or `migrate`) against Neon prod branch.
5. **Rate Limiting:** Add Vercel KV rate limiting to the public lead capture API.

---

## SECTION 10 — Release Plan

- **Phase 1: Internal Alpha (Sprint 6 completion)**
  - Deployed to staging. Agency staff dogfoods the system using dummy client accounts.
- **Phase 2: Data Migration**
  - Import existing active clients, projects, and open invoices from legacy tools via SQL script into Neon.
- **Phase 3: Beta (Pilot Clients)**
  - Invite 3 trusted, active clients to the new Client Portal. Monitor Sentry closely.
- **Phase 4: Full Production Rollout**
  - Agency-wide switch. Legacy tools put into read-only mode.
- **Rollback Strategy:**
  - If catastrophic failure (e.g., Stripe webhook failing repeatedly), revert DNS to legacy portal, manually reconcile payments, patch Aarotech, run data sync, flip DNS back.

---

## SECTION 11 — Final Checklist

### Pre-Launch (Engineering)
- [ ] All P0 and P1 tickets closed.
- [ ] Drizzle migrations applied to Prod DB successfully.
- [ ] Next.js build passes with 0 type errors or linting warnings.
- [ ] All E2E Playwright tests pass against Staging.
- [ ] Stripe Webhook verified receiving events in Staging.

### Pre-Launch (Security & Performance)
- [ ] IDOR tests passed (tenant isolation verified).
- [ ] Sentry is capturing errors.
- [ ] Dashboard loads in < 800ms.
- [ ] API Rate limiting active on public endpoints.
- [ ] No raw DB calls exist outside of `repositories.ts` files.
- [ ] All server actions wrapped in `createSafeAction`.

### Pre-Launch (UX)
- [ ] Every DataTable has an empty state illustration.
- [ ] Every list page has a `loading.tsx` skeleton.
- [ ] Breadcrumbs are visible on all workspace pages.
- [ ] Dark mode renders correctly on the Client Portal.
- [ ] Mobile responsive view tested on iPhone size for Portal.

### Launch Day
- [ ] Add production environment variables to Vercel.
- [ ] Register live webhook URLs with Clerk and Stripe.
- [ ] Run production data migration script.
- [ ] Create initial Admin/Owner account.
- [ ] Execute smoke test in production (create test lead -> deal -> proposal).
- [ ] Grant team access.
