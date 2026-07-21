# Aarotech Enterprise Platform — Master Development Plan (MDP)

**Role:** Chief Engineering Officer (CTO) & Principal Software Architect  
**Status:** Approved for Immediate Execution

This Master Development Plan (MDP) is the single source of truth for the engineering execution of the Aarotech Enterprise Platform. It synthesizes the TDD, PRD, UX Audit, EAIG, and Data Operations Specification into one exhaustive, actionable roadmap.

---

## 1. Executive Summary

- **Vision:** Deliver an enterprise-grade, highly scalable SaaS platform that unifies Sales (CRM), Delivery (Operations), and Finance under strict multi-tenant isolation, eliminating fragmented agency tools.
- **Current Status:** Architecture and Product Specifications are finalized. The engineering team is ready to commence the execution of Milestone 1.
- **Development Philosophy:** Domain-Driven Design (DDD), Server Actions wrapped in a safe error-handling context, strict row-level security (`organizationId`), and an event-driven side-effect architecture.
- **Success Metrics:** 0 tenant data leaks, < 1s p95 latency on portal loads, 100% test coverage on financial actions, zero regressions on core workflows.
- **Expected Scale:** Tens of thousands of active clients, hundreds of thousands of deliverables and invoices.

---

## 2. Product Inventory

*An exhaustive list of every moving piece in the system.*

**Workspaces:** Sales, Delivery, Finance, Directory, System, Client Hub.
**Pages:**
- `/` (Overview), `/inbox`
- `/sales/leads`, `/sales/pipeline`, `/sales/proposals`
- `/delivery`, `/delivery/projects`, `/delivery/projects/[id]`, `/delivery/tasks`, `/delivery/reviews`
- `/finance`, `/finance/invoices`, `/finance/invoices/[id]`, `/finance/payments`
- `/directory/organizations`, `/directory/organizations/[id]`, `/directory/contacts`
- `/settings/profile`, `/settings/team`, `/settings/services`, `/settings/system`
- `/portal/home`, `/portal/reviews`, `/portal/billing`, `/portal/documents`, `/portal/settings`
**Entities:** Organization, Contact, Lead, Deal, Proposal, Project, Task, Deliverable, DeliverableVersion, Invoice, Payment, Retainer, Activity, AuditLog, File.
**Modules:** Core, Auth, Sales, Delivery, Finance, Directory.
**Shared Components:** DataTable, KanbanBoard, FileUploader, TipTapEditor, CommandPalette, StatCard, StatusBadge, ActivityTimeline.
**APIs (Webhooks):** Clerk (Auth), Stripe (Payments), UploadThing (Files).
**Server Actions:** `createSafeAction` wrapper + CRUD++ for every entity.
**Domain Services:** SalesService, DeliveryService, FinanceService, DirectoryService.
**Events:** `OrganizationCreated`, `DealWon`, `ProposalAccepted`, `DeliverableApproved`, `InvoicePaid`.
**Integrations:** Clerk, Neon Postgres, Drizzle, Stripe, UploadThing, Resend, Trigger.dev (Background Jobs), Sentry, Axiom.

---

## 3. Dependency Map

The strict build order required to prevent circular dependencies and blocking rework.

**Foundation (Next.js, UI Components, SafeAction Wrapper)**
↓ *(Reason: UI and Action primitives are required by all domains)*
**Database Security (Schema, Organization ID, Tenancy)**
↓ *(Reason: DB schema must exist before any repositories are written)*
**Directory (Organizations, Contacts)**
↓ *(Reason: Every subsequent entity belongs to an Organization)*
**Sales (Leads, Deals, Proposals)**
↓ *(Reason: Projects originate from signed Proposals)*
**Finance (Invoices, Payments)**
↓ *(Reason: Conversion requires generating deposits/invoices instantly)*
**Conversion Engine (Events: Deal -> Project + Invoice)**
↓ *(Reason: Glues Sales, Finance, and Delivery together)*
**Delivery (Projects, Tasks, Deliverables)**
↓ *(Reason: Relies on the Conversion Engine to spawn Projects)*
**Client Hub (Portal Views)**
↓ *(Reason: Exposes Delivery and Finance data externally)*
**Notifications & Activity (Resend, Timelines)**
↓ *(Reason: Cross-cutting concerns relying on events)*
**Automation (Trigger.dev Background Jobs)**

---

## 4. Milestones

**Milestone 0: Project Setup & Foundation**
- **Goal:** Establish repo architecture, CI/CD, and DB connectivity.
- **Deliverables:** Next.js scaffolding, UI component library, Drizzle configured.
- **Risks:** Vercel/Neon connection bottlenecks. (Complexity: Low)

**Milestone 1: Security & Tenancy (Directory)**
- **Goal:** Guarantee multi-tenant isolation.
- **Deliverables:** Organizations, Contacts, Clerk Webhooks, SafeAction Wrapper with RBAC.
- **Risks:** Data leakage if `organizationId` is missed in schema. (Complexity: High)

**Milestone 2: Sales & CRM**
- **Goal:** Manage pre-sales pipeline.
- **Deliverables:** Leads, Deals, Kanban Board, Proposal Editor. (Complexity: Medium)

**Milestone 3: Finance Engine**
- **Goal:** Setup revenue collection.
- **Deliverables:** Invoices, Stripe integration, Webhooks. (Complexity: High)

**Milestone 4: Conversion & Delivery**
- **Goal:** Post-sales execution.
- **Deliverables:** Event Bus (Deal Won -> Project), Projects, Tasks, Deliverables, File Uploads. (Complexity: High)

**Milestone 5: Client Portal**
- **Goal:** External client views.
- **Deliverables:** Magic links, Client UI, Approval workflows. (Complexity: Medium)

---

## 5. Sprint Plan (Example for Milestone 4)

**Sprint 4.1: Delivery Data Layer**
- **Objectives:** Scaffold Repositories and Services for Delivery.
- **Files Affected:** `src/modules/delivery/repositories.ts`, `services.ts`.
- **Database:** Create `projects`, `tasks`, `deliverables` tables.
- **Done Criteria:** Integration tests pass for all Delivery CRUD operations.

**Sprint 4.2: Delivery UI & Actions**
- **Objectives:** Build Project Detail Page and Task Management.
- **Components:** DataTable for Tasks, Task Drawer.
- **Done Criteria:** User can create tasks and view project details in the UI.

**Sprint 4.3: The Conversion Engine**
- **Objectives:** Glue Sales and Delivery via Domain Events.
- **Files Affected:** `src/modules/core/events.ts`.
- **Done Criteria:** Signing a proposal automatically creates a Project in the DB.

---

## 6. Feature Breakdown: Deliverable Approvals

- **Purpose:** Allow clients to review and approve work.
- **Dependencies:** Files (UploadThing), Projects, Client Auth.
- **Backend:** `createDeliverableVersion`, `approveDeliverable`.
- **Frontend:** Deliverable Gallery, Split Button (Approve/Reject), File Preview.
- **Database:** `deliverable_versions` table.
- **Server Actions:** Wrapped in `createSafeAction` verifying `organizationId`.
- **Events:** `DeliverableApproved` (Triggers Slack alert / Email).
- **Testing:** Playwright E2E: Client logs in -> Clicks Approve -> Verify UI updates -> Verify Audit log.
- **Future Enhancements:** In-browser PDF/Image annotation.

---

## 7. Entity Implementation Order

1. **Organization** (Root tenant context).
2. **Contact** (Belongs to Organization).
3. **Lead** (Unqualified entity).
4. **Deal** (Qualified entity, linked to Organization).
5. **Proposal** (Linked to Deal).
6. **Invoice / Payment** (Linked to Organization, necessary for deposits).
7. **Project** (Generated upon Proposal acceptance + Deposit).
8. **Task / Deliverable** (Belongs to Project).
9. **Activity / AuditLog** (Cross-cutting, tracks all the above).

*Why this order?* It strictly follows referential integrity. You cannot build a Project without an Organization, and you shouldn't build a Project before you have the Deal/Proposal workflow that generates it.

---

## 8. UI Build Order

1. **Layouts:** `AdminLayout` (Sidebar + Topbar), `ClientLayout` (Minimal topbar).
2. **Generic Components:** Buttons, Inputs, Dialogs, Toasts, Status Badges, Typography.
3. **Complex Primitives:** `DataTable` (Generic), `KanbanBoard` (Generic).
4. **Forms:** Generic `AutoForm` using `react-hook-form` + `zod`.
5. **Drawers:** Slide-out right panels for Entity Details.
6. **Pages:** Starting with `/directory/organizations`, then moving up the dependency chain.

---

## 9. Backend Build Order

For every Bounded Context, build in this exact sequence:
1. **Schema (`schema.ts`)**: Define tables and constraints.
2. **Repositories**: Write Drizzle queries (always pass `organizationId`).
3. **Services**: Write business logic and emit Domain Events.
4. **Actions**: Write the `createSafeAction` HTTP wrapper.
5. **Webhooks/Jobs**: Implement background workers for Domain Events.

---

## 10. Testing Strategy

- **Unit:** (Vitest) Domain Services, Utility functions, Zod schemas.
- **Integration:** (Vitest + Test DB) Repositories, Server Actions (Verify RBAC and tenant isolation).
- **E2E:** (Playwright) Core user flows (Lead -> Deal -> Sign -> Invoice -> Pay -> Approve Deliverable).
- **Security:** Automated SAST for IDOR vulnerabilities on `organizationId`.
- **Manual QA:** Focus exclusively on Edge cases, UI rendering anomalies, and cross-browser quirks.

---

## 11. Technical Debt Rules

- **Forbidden:** Raw `fetch` calls from Client Components to DB. Raw Next.js Actions without the safe wrapper. Hard-deleting financial records.
- **Postponed:** Real-time WebSockets for notifications (V1 will use SWR polling). Advanced Redis caching (V1 relies on Next.js Data Cache).
- **RFC Required:** Introducing a new global dependency, adding a new database engine, altering the tenant isolation strategy.

---

## 12. Release Strategy

- **Alpha:** Internal dogfooding by the agency's own team. Dummy client accounts.
- **Internal Beta:** Moving historical active projects into the system manually.
- **Client Beta:** Inviting 5 trusted clients to the Client Hub for live approval workflows.
- **Production:** Full agency switchover.
- **Rollback Strategy:** Vercel instant rollback. DB migrations must be backward compatible (add columns, do not drop/rename in V1).

---

## 13. Long-Term Roadmap

- **Version 1 (Current):** Core CRM, Delivery, Finance, Portal.
- **Version 2:** Advanced Automations (Trigger.dev UI builder), Client In-App Messaging, Calendar Integrations.
- **Version 3:** Public API for Agency Clients, White-labeling (Custom domains for Client Hubs).
- **AI Features:** Automated proposal drafting, risk detection on overdue tasks, automated invoice reconciliation.

---

## 14. Engineering Pre-Merge Checklist

- [ ] Does this PR adhere to Domain Bounded Contexts (No cross-repo direct imports)?
- [ ] Do all DB queries include `organizationId` filtering?
- [ ] Are all Server Actions wrapped in `createSafeAction`?
- [ ] Is there an integration test for the Server Action?
- [ ] Does the UI implement Optimistic Updates and Loading Skeletons?
- [ ] Is `updated_at` used for Optimistic Locking on update mutations?

---

## 15. Project Completion Checklist (V1 Sign-Off)

- [ ] **Modules:** Directory, Sales, Delivery, Finance, Core, Identity.
- [ ] **Pages:** 22 total pages implemented (Admin + Client Hub).
- [ ] **Workflows:** Deal Conversion (Deal -> Project + Invoice). Client Approval (Draft -> Approved).
- [ ] **APIs:** Clerk, Stripe, UploadThing fully integrated and secured.
- [ ] **Security:** Penetration test verifies no cross-tenant IDOR access.
- [ ] **Testing:** Playwright E2E suite passes 100%.
- [ ] **Integrations:** Resend transaction emails verified.
- [ ] **Documentation:** Runbook updated for DevOps and DB Rollbacks.
