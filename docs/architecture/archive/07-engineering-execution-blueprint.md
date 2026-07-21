# Aarotech Enterprise Platform — Engineering Execution Blueprint (EEB)

**Role:** Chief Technology Officer / Principal Software Architect  
**Status:** Approved for Immediate Execution

This Engineering Execution Blueprint (EEB) translates the theoretical specifications (TDD, PRD, EAIG, MDP) into a literal, step-by-step execution playbook. It is designed to be followed verbatim by human developers and AI coding assistants to ensure flawless, secure, enterprise-grade execution.

---

## 1. Repository Initialization

**Required Packages:**
- `next@latest`, `react`, `react-dom`
- `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
- `@clerk/nextjs`
- `next-safe-action`, `zod`
- `stripe`, `uploadthing`, `resend`
- `lucide-react`, `tailwind-merge`, `clsx` (shadcn/ui dependencies)

**Folder Creation Order:**
1. `src/modules/core/` (DB, Auth, SafeAction wrappers)
2. `src/modules/directory/` (Foundational Tenant Data)
3. `src/modules/sales/`, `src/modules/delivery/`, `src/modules/finance/`
4. `src/app/(admin)/`, `src/app/(client)/portal/`
5. `src/components/ui/`, `src/components/shared/`

**Configuration Files:**
- `drizzle.config.ts` (Point to Neon via `DATABASE_URL`)
- `middleware.ts` (Clerk Auth & Tenant routing protection)

**Environment Variables:**
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `UPLOADTHING_SECRET`, `RESEND_API_KEY`.

---

## 2. Database Implementation

**Table Creation Order (Referential Integrity):**
1. `organizations`, `users`
2. `contacts`, `leads`, `deals`
3. `proposals`
4. `retainer_periods`, `projects`
5. `tasks`, `deliverables`, `deliverable_versions`
6. `invoices`, `payments`
7. `activity_logs`, `audit_logs`

**Constraints & Indexes:**
- Every tenant table MUST have `organization_id` FK to `organizations(id)` with `ON DELETE CASCADE` (where applicable).
- Multi-column index on `(organization_id, id)` for rapid tenant lookups.
- Multi-column index on `(organization_id, deleted_at)` for active record filtering.

---

## 3. Backend Implementation Order

For every module, execute in this precise order:
1. **Repository Layer:** Create CRUD operations strictly filtering by `organizationId`. Implement soft delete (`deleted_at = NOW()`).
2. **Validation:** Create Zod schemas (`CreateEntitySchema`, `UpdateEntitySchema`).
3. **Service Layer:** Write pure business logic orchestrating the repositories.
4. **Events:** Define and emit Domain Events within transactions.
5. **Server Actions:** Expose the Service Layer to the UI via `createSafeAction`.
6. **Tests:** Write integration tests mocking DB access.

---

## 4. Frontend Implementation Order

For every Workspace (e.g., Sales, Delivery, Finance):
1. **Layout:** Build `layout.tsx` (Sidebar + Topbar for Admin, Minimal for Client).
2. **Empty States:** Build placeholders for zero-data scenarios.
3. **Components:** Build specific cards or lists (e.g., `PipelineKanban`, `InvoiceTable`).
4. **Pages:** Compose pages by fetching data directly from Repositories (RSC) and passing to Client Components.
5. **Drawers/Dialogs:** Implement forms passing data back to Server Actions.
6. **Loading States:** Create `loading.tsx` and skeleton fallbacks via Suspense boundaries.
7. **Error States:** Create `error.tsx` catching `SafeAction` errors.

---

## 5. Component Build Queue

Build generic components before specific ones.
1. `Button`, `Input`, `Label`, `Select` (shadcn/ui primitives).
2. `StatusBadge` (Standardized green/yellow/red pills).
3. `DataTable` (Generic client-side table with sorting/pagination).
4. `EntityDrawer` (Slide-out panel for forms).
5. `AutoForm` (Zod to form generator).
6. `FileUploader` (UploadThing wrapper).
7. `ActivityTimeline` (Vertical dot-and-line feed).

---

## 6. Server Action Build Queue

1. `createOrganization`, `updateOrganization`
2. `createLead`, `convertLeadToDeal`
3. `createProposal`, `signProposal`
4. `createTask`, `updateTaskStatus`
5. `uploadDeliverableVersion`, `approveDeliverable`
6. `generateInvoice`, `processStripeWebhook`

---

## 7. Event Implementation Queue

1. `OrganizationCreated` -> Triggers welcome emails, default settings sync.
2. `ProposalAccepted` -> Triggers Project generation, Deposit Invoice generation.
3. `DeliverableApproved` -> Triggers Slack notification, unblocks next task.
4. `InvoicePaid` -> Transitions Project from Pending to Active.

---

## 8. Notification Implementation Queue

1. Base `NotificationService` (DB wrapper).
2. React Email template for `InvoiceDue`.
3. React Email template for `DeliverableReviewRequested`.
4. Webhook consumer bridging Stripe events to Email alerts.

---

## 9. Testing Queue

1. **DB Transaction Integrity:** Test that Proposal->Project conversion rolls back if Project creation fails.
2. **Tenant Security (IDOR):** Attempt to fetch Project X using User Y's token (must fail).
3. **Playwright E2E:** 
   - Internal Rep creates Deal -> Sends Proposal.
   - External Client signs Proposal -> Checks Invoice -> Approves Deliverable.

---

## 10. Deployment Checklist

- [ ] Vercel Environment Variables verified.
- [ ] Database migrated against production Neon branch.
- [ ] Stripe Webhooks verified pointing to production domain.
- [ ] Clerk Webhooks verified pointing to production domain.
- [ ] Sentry DSN active.

---

## 11. Definition of Done (DoD) per Milestone

A milestone is Done ONLY when:
- Code is merged to main.
- Drizzle migrations applied cleanly.
- `organizationId` is enforced on every new table.
- Every new Server Action uses `createSafeAction`.
- All Zod validation rules pass.
- Playwright E2E tests for the core milestone feature pass.

---

## 12. Strict AI Coding Rules

**ATTENTION ALL AI CODING ASSISTANTS:**
- **RULE 1:** Never bypass Repositories. You must not call Drizzle/Neon directly from `app/` routes.
- **RULE 2:** Never access the database from Client Components (`"use client"`).
- **RULE 3:** Never duplicate business logic. If a transition is complex, it lives in a Service, not an Action.
- **RULE 4:** Always use `createSafeAction` from the `core/actions` module. Do not write raw `use server` functions.
- **RULE 5:** Always enforce `organizationId`. If you write a query `eq(table.id, id)` without `eq(table.organizationId, orgId)`, you have introduced a critical security vulnerability.
- **RULE 6:** Always generate audit logs on destructive or state-changing mutations.
- **RULE 7:** Follow the approved architecture exactly. Do not invent new structures or generic monolithic folders.

---

## 13. Implementation Prompts (For AI Assistants)

### Prompt 1: Foundation Setup
**Objective:** Scaffold the Drizzle DB and Safe Action wrapper.
**Context:** We need the core DB connection and the `createSafeAction` utility that enforces tenant validation before building modules.
**Files:** `src/modules/core/db/index.ts`, `src/modules/core/actions/safe-action.ts`.
**Acceptance Criteria:** `createSafeAction` successfully intercepts execution, validates session/org via Clerk, and returns typed errors.

### Prompt 2: Directory Data Layer
**Objective:** Create the Organizations and Contacts tables and repositories.
**Context:** This is the root tenant context. Every other module depends on this.
**Files:** `src/modules/core/db/schema.ts`, `src/modules/directory/repositories.ts`.
**Acceptance Criteria:** Tables exist with `deleted_at`. Repositories fetch contacts filtered by `organizationId`.

### Prompt 3: Sales UI
**Objective:** Build the Leads table and Kanban Pipeline.
**Context:** The Sales Workspace needs interactive views for pre-sales data.
**Files:** `src/app/(admin)/sales/pipeline/page.tsx`, `src/components/shared/KanbanBoard.tsx`.
**Acceptance Criteria:** User can drag a Deal card from 'Discovery' to 'Proposal'. Dropping the card triggers the `updateDealStage` Safe Action. Optimistic UI applies instantly.

*(Use these prompts sequentially to instruct AI tools to build the system block-by-block).*
