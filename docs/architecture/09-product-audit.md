# Aarotech Enterprise Platform — Product UX & Workflow Audit
### Expected vs. Actual — Lead Product Architect & Enterprise UX Auditor Report

> **Scope:** PRD · TDD · MDP · Engineering Execution Blueprint (EEB) · EAIG
> **Date:** 2026-07-21
> **Verdict:** ⚠ Feature-Incomplete with Critical Workflow Failures

---

## SECTION 1 — Expected Workflow (Per PRD/TDD/MDP)

### Dashboard (/)
Expected:
- Executive Command Center at root `/`
- KPI cards: Active Clients, Open Invoices, Active Projects, Tasks Due Today, Pipeline Value
- Revenue summary chart
- Recent Activity feed (last 10 events)
- Notifications bell/inbox strip
- Quick Actions: New Deal, New Invoice, New Task
- Team Performance overview
- Calendar widget for upcoming due dates

### CRM (Global Admin)
Expected:
- Unified sidebar workspace navigation: Sales, Delivery, Finance, Directory, System
- No duplication between workspaces
- Routes: `/sales/leads`, `/sales/pipeline`, `/sales/proposals`, `/delivery/...`, `/finance/...`, `/directory/...`

### Contacts (/directory/contacts)
Expected:
- Standalone contacts directory
- Fields: Name, Email, Phone, Organization link
- Create, Edit, Soft-delete
- Link to parent Organization profile

### Organizations (/directory/organizations)
Expected:
- Root-level directory of all organizations
- Lifecycle: Lead → Prospect → Client → Archived
- Health score display
- Sub-pages: individual org profile with contacts, deals, projects, invoices

### Sales — Leads (/sales/leads)
Expected:
- `websiteLeads` table (unqualified external inquiries)
- CRUD + "Promote to Deal" action
- Filter by status: New, Contacted, Qualified, Archived
- Bulk actions

### Sales — Pipeline (/sales/pipeline)
Expected:
- Kanban board of **Deals** (NOT organizations/leads)
- Columns: Discovery → Qualified → Proposal → Negotiation → Won → Lost
- Drag-and-drop with optimistic UI
- Deal value & owner shown per card
- Column totals
- Quick "Add Deal" action from kanban header

### Sales — Proposals (/sales/proposals)
Expected:
- Master list of all proposals across deals
- TipTap WYSIWYG editor for content
- Line items editor
- Status filter: Draft, Sent, Accepted, Rejected
- "Send to Client" action → generates magic link
- Approval tracking (IP, signature, timestamp)

### Projects (/delivery/projects)
Expected:
- **Delivery workspace** only — operations team's view
- Projects created automatically by the Conversion Engine (ProposalAccepted event)
- Project detail page with: Header, Tabs (Overview, Tasks, Deliverables, Activity)
- Progress bar, Budget Burn Rate widget
- Overdue Tasks counter

### Tasks (/delivery/tasks)
Expected:
- Global cross-project task board for assignees
- Filter by: Status, Assignee, Project, Due Date
- Task Drawer (slide-in panel) for detail/edit
- Keyboard shortcut: `c` to create task
- Bulk assign/delete

### Deliverables (/delivery/reviews)
Expected:
- Global queue of all deliverables awaiting internal/client review
- File gallery with image/PDF preview
- Version history per deliverable
- Internal vs. client-visible comments
- "Submit for Review" → Client Portal auto-notified

### Finance (/finance)
Expected:
- Revenue Command Center: Total Revenue, Outstanding, Overdue, MRR from retainers
- `/finance/invoices` list with create/edit/void
- `/finance/invoices/[id]` detail page
- `/finance/payments` — payment ledger
- Stripe + manual payment recording
- Retainer management

### Client Portal (/portal/...)
Expected:
- `/portal/home` — Action-oriented dashboard: Pending approvals, outstanding invoices, project status
- `/portal/reviews` — Deliverables needing approval with Approve/Request Changes split button
- `/portal/billing` — Invoice list + Stripe embedded checkout
- `/portal/documents` — Contracts & signed proposals
- `/portal/settings` — Client account settings
- Magic link login flow

### Notifications (/inbox)
Expected:
- Dedicated `/inbox` page for all system notifications
- Bell icon in topbar with unread count badge
- Real-time or polling-based updates
- Types: Proposal accepted, Invoice due, Deliverable approved, Client action required

### Automation (/system/automations or /settings/automations)
Expected:
- Trigger.dev-powered background job monitoring
- Visual job status dashboard
- Job trigger rules configurable by admin
- Dead-letter queue visibility

### Settings (/settings/...)
Expected:
- `/settings/profile` — User profile
- `/settings/team` — Team member management with RBAC role assignment
- `/settings/services` — Service catalog
- `/settings/system` — Agency-level branding, billing, tax settings

---

## SECTION 2 — Actual Implementation

Based on direct inspection of the source files.

### Navigation Architecture
- **Actual:** Single monolithic sidebar at `/crm/*` containing ALL workspaces — Sales, Delivery, Finance, Directory, Automations, Settings — mixed inside one `/crm/` route group.
- **Route evidence:** `SidebarNav.tsx` uses `/crm/leads`, `/crm/proposals`, `/crm/finance`, `/crm/projects`, `/crm/contacts`, `/crm/kb`, `/crm/automations` — all prefixed `/crm/`
- **Separately:** `/sales/` and `/delivery/` route groups also exist as ghost duplicates

### Dashboard (/)
- **Actual:** The root `/crm` route renders the **Sales Pipeline Kanban Board** (`KanbanBoard`).
- **Evidence:** `src/app/(admin)/crm/page.tsx` — renders `<KanbanBoard initialDeals={allDeals} />`
- No executive KPIs, no revenue summary, no activity feed, no team performance.

### Sales — Leads
- **Actual:** `/sales/leads` exists and correctly fetches `organizations` filtered by `type = "lead"` or `status = "lead"` from `src/app/(admin)/sales/leads/page.tsx`.
- **Note:** Leads are modeled as `organizations` not as the separate `websiteLeads` table. The `LeadsTable` component renders them.
- **Secondary duplicate:** `/crm/leads` also exists inside the CRM route group showing the same data from `websiteLeads` table.

### Sales — Pipeline
- **Actual:** `/sales/pipeline` exists with `PipelineBoard.tsx` — a proper client-side drag-and-drop Kanban using `updateDealStage` server action.
- **Duplicate:** `/crm` (root CRM dashboard) also renders a full Kanban — separate instance, different source file (`KanbanBoard.tsx` in `/crm/_components/`).
- **Status:** Functioning, but duplicated.

### Sales — Proposals
- **Actual:** `/crm/proposals` exists with a table list. Proposal detail page at `/crm/proposals/[proposalId]` exists with `LineItemsEditor.tsx` and `ProposalActions.tsx`.
- **Missing:** No dedicated `/sales/proposals` route as PRD specifies.
- **Missing:** No TipTap WYSIWYG editor — `documentData` is a plain text field.
- **Present:** Line item editor, proposal status, approval workflow with IP/signature capture.

### Projects
- **Actual:** THREE separate project list pages exist:
  1. `/crm/projects/page.tsx` — CRM workspace
  2. `/delivery/projects/page.tsx` — Delivery workspace
  3. `/crm/clients/[clientId]` — Client-scoped
- **Critical:** `ProposalAccepted` event does NOT auto-create a project. In `src/modules/sales/services.ts`, `approveProposalByToken()` emits `ProposalAccepted` but the event handler in `events.ts` only sends an in-app notification — **no project is created.**
- **Tabs on project detail:** Not verified as fully implemented with Overview/Tasks/Deliverables/Activity tabs.

### Tasks
- **Actual:** `/crm/tasks/page.tsx` — a simple list view showing all tasks across projects.
- **Missing:** No Task Drawer (slide-in panel), no per-assignee filter, no keyboard shortcut, no bulk actions.
- **Global tasks page** is the only delivery mechanism — no cross-workspace task board (`/delivery/tasks` does not exist).

### Deliverables
- **Actual:** `/crm/deliverables/` exists but only has `[deliverableId]` detail route and `actions.ts` — **no deliverable list/queue page** at `/delivery/reviews`.
- **Present in client portal:** `/portal/deliverables/[deliverableId]` with `ReviewActions.tsx` for approve/reject.
- **Missing:** `/delivery/reviews` global queue (the operations team's master deliverables view).

### Finance
- **Actual:** The Finance module lives in two places:
  1. `/crm/finance` — in the CRM sidebar (a billing page)
  2. `/crm/billing/` — invoice list + detail
  3. `/finance/page.tsx` — a standalone finance page also exists
- **Content:** Finance page shows invoice table + 1 KPI card (Total Outstanding). Very basic.
- **Missing:** `/finance/payments` ledger page, retainer billing view, MRR chart, Stripe embedded checkout (only manual Razorpay/UTR flow).
- **Critical:** `createInvoiceAction` in `billing.ts` calls `db.insert` **directly** — bypasses repository pattern entirely.

### Client Portal
- **Actual:** Portal home at `/portal/page.tsx` renders 3 KPI cards and "Project Status" + "Recent Documents".
- **Critical Bug:** "Project Status" section fetches from `deals` table, not `projects` table. It renders `project.stage` (a deal field) as progress — **clients see deal stages instead of project progress.**
- **Present:** `/portal/billing`, `/portal/deliverables`, `/portal/proposals`, `/portal/assets`.
- **Missing:** `/portal/reviews` as a standalone approval queue. `/portal/documents` route. `/portal/settings`.
- **Account Health:** Hardcoded as "Excellent" string — not computed from data.

### Settings
- **Actual:** `/settings/` has `page.tsx` + `/settings/team` only.
- **Missing:** `/settings/profile`, `/settings/system` (agency branding/tax settings).
- **Services catalog** is under `/crm/settings/services/` — wrong namespace.

### Notifications/Inbox
- **Actual:** No `/inbox` page. No bell icon visible in sidebar. In-app notifications fire to hardcoded user IDs like `"internal_team"`, `"finance_team"` — not real user IDs.
- **Evidence:** `events.ts` — `sendInAppNotification({ userId: "internal_team", ... })`.

### Automation
- **Actual:** `/crm/automations/page.tsx` exists — shows a log viewer for `automationLogs` table.
- **Present:** Job status counts (total, successful, failed), payload preview.
- **Missing:** No actual Trigger.dev integration. No job rule configuration. No dead-letter queue. Just a passive log viewer.

---

## SECTION 3 — Missing Features

| # | Feature | Expected Route | Status |
|---|---------|----------------|--------|
| 1 | Executive Dashboard (KPIs, Revenue, Activity) | `/` | ❌ Missing |
| 2 | Inbox / Notification Center | `/inbox` | ❌ Missing |
| 3 | Directory — Organizations | `/directory/organizations` | ❌ Missing |
| 4 | Directory — Contacts standalone | `/directory/contacts` | ❌ Missing |
| 5 | Global Deliverables Review Queue | `/delivery/reviews` | ❌ Missing |
| 6 | Task Global Board (cross-project) | `/delivery/tasks` | ❌ Missing |
| 7 | Finance — Payments Ledger | `/finance/payments` | ❌ Missing |
| 8 | Finance — Retainer Billing | `/finance/retainers` | ❌ Missing |
| 9 | Client Portal — Document Center | `/portal/documents` | ❌ Missing |
| 10 | Client Portal — Settings | `/portal/settings` | ❌ Missing |
| 11 | Client Portal — Approval Review Queue | `/portal/reviews` | ❌ Missing (as route) |
| 12 | Conversion Engine (Proposal → Project auto-creation) | Event-driven | ❌ Missing |
| 13 | TipTap WYSIWYG for Proposals | `/crm/proposals/[id]` | ❌ Missing |
| 14 | Global Command Palette (Cmd+K) | Global | ❌ Missing |
| 15 | Settings — System (Agency branding/tax) | `/settings/system` | ❌ Missing |
| 16 | Settings — Profile | `/settings/profile` | ❌ Missing |
| 17 | Real Notification System (dynamic user IDs) | System-wide | ❌ Missing |
| 18 | Task Drawer (slide-in panel) | `/delivery/projects/[id]` | ❌ Missing |
| 19 | Bulk Actions on Tables | All data tables | ❌ Missing |
| 20 | Project Detail — Tabs (Overview/Tasks/Deliverables/Activity) | `/delivery/projects/[id]` | ⚠ Unverified |
| 21 | In-App Search (Global Postgres tsvector / Algolia) | Global | ❌ Missing |
| 22 | Stripe Embedded Checkout on Client Portal | `/portal/billing` | ❌ Missing (UTR/manual only) |

---

## SECTION 4 — Incorrect Features

### 4.1 — Dashboard Shows Sales Pipeline Instead of Executive Analytics
- **Current:** `/crm` (the dashboard route) renders a full Kanban sales pipeline board.
- **Expected:** The dashboard should be an executive Command Center with KPIs, revenue, activity, and quick actions.
- **Severity:** 🔴 Critical
- **Why:** The dashboard is the first screen every internal user sees. Showing the pipeline to a Finance Officer or a PM is meaningless and disorienting.

### 4.2 — Client Portal Shows Deals Instead of Projects
- **Current:** `portal/page.tsx` fetches from `deals` table, calls results "Active Projects", displays deal `stage` as a progress bar, and computes "Total Investment" from `deal.value`.
- **Expected:** Should fetch from `projects` table. Show project status, deliverable counts, pending approvals.
- **Severity:** 🔴 Critical
- **Why:** Clients should see their project progress, not your internal deal data. This is a data boundary violation that erodes trust.

### 4.3 — Leads Are Modeled as Organizations (Identity Confusion)
- **Current:** `/sales/leads/page.tsx` fetches `organizations` with `type = "lead"`. This conflates a lead (an unqualified inquiry from `websiteLeads`) with a partially-created Organization.
- **Expected:** Leads in `/sales/leads` should show the `websiteLeads` table. Promoting a lead via `qualifyLead()` should then create the Organization. The `/crm/leads` already does this correctly — the `/sales/leads` does not.
- **Severity:** 🟠 High
- **Why:** Creates confusion about what "lead" means across the system. Two pages showing two different entities both labeled "Leads."

### 4.4 — Notification System Uses Hardcoded User IDs
- **Current:** `events.ts` calls `notificationService.sendInAppNotification({ userId: "internal_team", ... })`.
- **Expected:** Should resolve real user IDs from Clerk membership roles (e.g., all users with `role = "admin"` in the org).
- **Severity:** 🟠 High
- **Why:** Notifications will never reach real users. The entire notification system is functionally broken for real-world use.

### 4.5 — Finance Logic Bypasses Repository Pattern
- **Current:** `billing.ts` directly calls `db.insert(invoices)`, `db.insert(payments)`, `db.update(invoices)` — raw Drizzle in a Server Action.
- **Expected:** All DB access should flow through `FinanceRepository` → `FinanceService` → Server Action.
- **Severity:** 🟠 High (Architecture Violation)
- **Why:** This is explicitly forbidden by EEB Rule 1 ("Never bypass Repositories") and EAIG Section 3. Financial mutations without service layer = no business rule enforcement.

### 4.6 — Duplicate Pipeline/Project Pages Across Workspaces
- **Current:** `/crm/projects`, `/delivery/projects`, and `/crm` all show project-related data. `/sales/pipeline` and `/crm` both show deal Kanban boards.
- **Expected:** One authoritative page per entity type in its designated workspace.
- **Severity:** 🟡 Medium
- **Why:** Users don't know which view is the "real" one. Data can get out of sync. Violates Single Source of Truth principle.

### 4.7 — Account Health Hardcoded as "Excellent"
- **Current:** `portal/page.tsx` — `<div className="text-2xl font-bold text-blue-400">Excellent</div>` — literal string, no computation.
- **Expected:** Computed from health score in `organizations.healthScore` or derived from overdue tasks/invoices.
- **Severity:** 🟡 Medium

---

## SECTION 5 — Workflow Problems

### WF-1: Proposal → Project Conversion is BROKEN
- **Expected workflow:** Client signs proposal → `ProposalAccepted` event → Conversion Engine auto-creates Project + Deposit Invoice → PM receives notification → Project enters "Active" state.
- **Actual:** `approveProposalByToken()` emits `ProposalAccepted` → `events.ts` handler sends a generic in-app notification to a hardcoded `"internal_team"` user ID. **No project is created. No invoice is generated. Nothing is automatic.**
- **Why this is wrong:** This is the single most critical workflow in the entire system. It is the business engine that converts revenue into delivery. It is completely missing.

### WF-2: Lead → Deal → Pipeline Workflow is Fragmented
- **Expected:** Website Lead captured → Internal user promotes lead → Deal created → Deal moves through Kanban stages.
- **Actual:** `qualifyLead()` in `SalesService` correctly creates an Org + Contact + Deal. BUT `/sales/leads` fetches `organizations` (not `websiteLeads`). Users would promote from the wrong page and see no feedback from `qualifyLead()`.

### WF-3: Invoice → Payment → Project Activation is Missing
- **Expected:** `InvoicePaid` event → Project status transitions from `pending_deposit` → `active`. Delivery team notified.
- **Actual:** `markInvoicePaidManuallyAction()` marks invoice as paid and inserts a payment record but **does NOT emit `InvoicePaid`** and does NOT transition any Project state.

### WF-4: Deliverable Review Lifecycle is Incomplete from Internal Side
- **Expected:** PM uploads deliverable → marks it for client review → Client sees it in `/portal/reviews` → Client approves/rejects → PM notified → If approved, task unlocks.
- **Actual:** Client-side approval exists (`ReviewActions.tsx`). PM-side submit for review exists (`actions.ts`). But there is no global `/delivery/reviews` queue for PMs to see the complete review pipeline. The workflow exists in pieces but has no connective operational view.

### WF-5: Client Portal Onboarding Flow is Undefined
- **Expected:** After deal conversion, client receives magic link → Signs in to portal → Completes onboarding checklist → Accesses their dedicated portal.
- **Actual:** Client portal login works via Clerk. Onboarding steps exist in DB (`clientOnboardings`, `onboardingSteps`). But there is no onboarding checklist UI in the portal, no magic link generation flow visible in the codebase, and no step-through wizard.

---

## SECTION 6 — UX Problems

### UX-1: Navigation Architecture is Fundamentally Wrong
- **Current:** Everything lives under `/crm/` — a monolithic route group acting as the entire application shell. The PRD specifies 5 separate workspaces: Sales, Delivery, Finance, Directory, System.
- **Impact:** A Finance Officer must navigate through a CRM sidebar to find billing. A PM must look inside a CRM to find projects. The workspace mental model is shattered.
- **Severity:** 🔴 Critical

### UX-2: Two Sidebars, Two Route Groups, No Hierarchy
- **Current:** Both `/sales/layout.tsx` and `/delivery/layout.tsx` exist with their own sidebar layouts. But the CRM sidebar also links to these same sub-sections. Result: the navigation hierarchy is inconsistent depending on which route you're on.
- **Impact:** Users will bookmark `/crm/projects` vs `/delivery/projects` and see different data structures for the same entity.

### UX-3: Breadcrumbs Are Absent Platform-Wide
- **Expected:** Every page should show its workspace context: `Sales / Pipeline / Deal: Acme Corp`
- **Actual:** No breadcrumb component found anywhere in the inspected files.

### UX-4: Empty States Are Inconsistent
- **Current:** Some pages (e.g., `delivery/projects`) show a styled empty state ("Win a deal to create one!"). Others (e.g., `tasks/page.tsx`) show plain text. Finance page says "No invoices found."
- **Expected per PRD:** Every empty state must have an illustration and a contextual call-to-action button.

### UX-5: Loading States / Skeletons Are Not Verified Platform-Wide
- **Expected:** Every data-fetching page must have a `loading.tsx` with skeleton loaders.
- **Actual:** No `loading.tsx` files found in the inspected route directories. This means Next.js will show a blank screen during data fetching.

### UX-6: Sidebar Labels Are Confusing
- **Current:** Sidebar links include "Website Leads" and "Dashboard" — but the dashboard shows a Pipeline, not an overview. "Dashboard" is misleading.
- The sidebar mixes operational items (Proposals, Finance) with system items (Automations, Services Catalog) with no logical grouping beyond vague "Agency Workspace" and "System" labels.

### UX-7: No Topbar / Utility Bar
- **Expected:** Persistent topbar with: Global Search, Notification Bell (with unread count), User Avatar / Profile menu, Organization switcher.
- **Actual:** Not visible in inspected layout files.

### UX-8: Tables Lack Sorting, Filtering, and Pagination Controls
- **Current:** Projects, proposals, tasks, invoices pages all use bare HTML `<table>` or shadcn `Table` without sort headers, filter dropdowns, or accessible bulk checkboxes.
- **Expected:** Generic `<DataTable />` with TanStack Table, server-side sorting via URL params, bulk action floating bar.

---

## SECTION 7 — Architecture Deviations

| # | Deviation | Expected | Actual | Severity |
|---|-----------|----------|--------|----------|
| AD-1 | Finance bypasses repository | `FinanceService → FinanceRepository → DB` | Direct `db.insert` in Server Action | 🔴 Critical |
| AD-2 | No `src/modules/finance` exists | Dedicated bounded context | Logic split across `app/actions/billing.ts` and `crm/finance` page | 🔴 Critical |
| AD-3 | Conversion Engine missing | `ProposalAccepted` → auto-create Project | Event fires, nothing creates a project | 🔴 Critical |
| AD-4 | `createSafeAction` not universally used | Every Server Action must use wrapper | Many actions use raw `"use server"` + direct `db` calls | 🟠 High |
| AD-5 | Route structure violates PRD sitemap | `/sales/`, `/delivery/`, `/finance/`, `/directory/` top-level workspaces | Everything under `/crm/` | 🟠 High |
| AD-6 | Client portal fetches wrong entity | Should fetch from `projects` | Fetches from `deals` | 🔴 Critical |
| AD-7 | `createSafeAction` defined but not used in finance | EEB mandates wrapper | `billing.ts` bypasses it | 🟠 High |
| AD-8 | Notification `userId` is hardcoded | Should be dynamic role resolution | Hardcoded `"internal_team"` | 🟠 High |
| AD-9 | Drawer-based navigation not implemented | URL-managed drawers `?modal=new-task` | No drawers found; modals use hidden React state | 🟡 Medium |
| AD-10 | No Optimistic Locking | `updated_at` check on all updates | No version/timestamp concurrency check found | 🟡 Medium |

---

## SECTION 8 — Priority Matrix

### 🔴 P0 — Must Fix Immediately (Blocks Core Business Function)
| ID | Issue |
|----|-------|
| P0-1 | Conversion Engine: ProposalAccepted does not create Project |
| P0-2 | Client Portal fetches `deals` instead of `projects` |
| P0-3 | `InvoicePaid` does not transition Project status |
| P0-4 | Notification system sends to hardcoded user IDs |
| P0-5 | Finance module has no service/repository layer |

### 🟠 P1 — Fix Before Production (Breaks Enterprise Workflows)
| ID | Issue |
|----|-------|
| P1-1 | Dashboard shows Pipeline instead of Executive KPIs |
| P1-2 | Navigation architecture does not match PRD workspace spec |
| P1-3 | `/delivery/reviews` global deliverables queue missing |
| P1-4 | Lead entity confusion (Organizations vs websiteLeads) |
| P1-5 | `/inbox` notification center missing |
| P1-6 | Task Drawer missing from project detail |
| P1-7 | `createSafeAction` not universally applied |
| P1-8 | No `loading.tsx` skeleton loaders on data pages |

### 🟡 P2 — Should Fix (Significant UX/Product Gap)
| ID | Issue |
|----|-------|
| P2-1 | Breadcrumbs absent platform-wide |
| P2-2 | Topbar with search, notifications, user menu missing |
| P2-3 | Empty states lack illustrations and CTAs |
| P2-4 | Tables lack sorting, filtering, bulk actions |
| P2-5 | Duplicate pages across workspaces |
| P2-6 | `/portal/documents` and `/portal/settings` missing |
| P2-7 | Hardcoded "Excellent" account health |
| P2-8 | TipTap WYSIWYG for proposals missing |

### 🟢 P3 — Future Enhancement
| ID | Issue |
|----|-------|
| P3-1 | Global Command Palette (Cmd+K) |
| P3-2 | In-app real-time notifications (Pusher/WebSockets) |
| P3-3 | In-browser PDF/Image annotation on deliverables |
| P3-4 | Calendar widget on dashboard |
| P3-5 | Team performance charts |

---

## SECTION 9 — Rebuild Recommendations

### RB-1: Implement the Conversion Engine

| | |
|---|---|
| **Current** | `ProposalAccepted` event fires → generic in-app notification to `"internal_team"` |
| **Expected** | `ProposalAccepted` → DB transaction: (1) Create Project from Deal data, (2) Create Deposit Invoice, (3) Notify Sales Rep + PM via real user IDs |
| **Why it matters** | This is the foundational pipeline automation. Without it, every deal conversion is a manual operation — the system cannot scale. |
| **Rebuild** | Add `ProposalAccepted` handler inside `events.ts` that calls `DeliveryService.createProjectFromDeal(dealId)` and `FinanceService.createDepositInvoice(orgId, projectId, amount)` inside a DB transaction |
| **Complexity** | Medium (2–3 days) |

### RB-2: Fix the Finance Module Architecture

| | |
|---|---|
| **Current** | `billing.ts` Server Action calls Drizzle directly: `db.insert(invoices)`, `db.update(invoices)` |
| **Expected** | `src/modules/finance/` with `repositories.ts`, `services.ts`, `actions.ts` |
| **Why it matters** | Financial mutations without business rule enforcement are a compliance and correctness risk |
| **Rebuild** | Create `src/modules/finance/repositories.ts` (CRUD for invoices/payments), `services.ts` (business rules: can't void paid invoice), refactor `billing.ts` to call the service layer |
| **Complexity** | Medium (1–2 days) |

### RB-3: Fix Client Portal Data Source

| | |
|---|---|
| **Current** | `portal/page.tsx` → `db.query.deals.findMany(...)` labeled as "Active Projects" |
| **Expected** | `portal/page.tsx` → `db.query.projects.findMany(where: orgId)` showing real project status |
| **Why it matters** | Clients see internal deal stage data — a trust and data boundary violation |
| **Rebuild** | Replace `deals` query with `projects` query. Show project name, status, health, outstanding invoices count, pending deliverables count |
| **Complexity** | Low (2–4 hours) |

### RB-4: Rebuild Navigation to Match PRD Workspace Spec

| | |
|---|---|
| **Current** | Monolithic `/crm/*` sidebar with all features mixed in |
| **Expected** | Separate workspace sidebars: Sales, Delivery, Finance, Directory |
| **Why it matters** | Role-based navigation is core to enterprise UX — Finance Officers shouldn't see a CRM pipeline |
| **Rebuild** | Create workspace-scoped layouts: `(admin)/sales/layout.tsx` (Leads, Pipeline, Proposals), `(admin)/delivery/layout.tsx` (Projects, Tasks, Reviews), `(admin)/finance/layout.tsx` (Invoices, Payments, Retainers), `(admin)/directory/layout.tsx` (Orgs, Contacts) |
| **Complexity** | Medium (2–3 days) |

### RB-5: Build the Executive Dashboard

| | |
|---|---|
| **Current** | `/crm` renders Pipeline Kanban |
| **Expected** | Executive Command Center at `/` with KPI cards, revenue chart, activity feed |
| **Why it matters** | First screen every user sees should give business context, not a task-specific view |
| **Rebuild** | New `/page.tsx` in admin group that aggregates: `COUNT(projects WHERE status='active')`, `SUM(invoices WHERE status='open')`, `COUNT(tasks WHERE dueDate < NOW())`, last 10 `activityLogs`, pipeline deal values |
| **Complexity** | Low-Medium (1 day) |

### RB-6: Fix Notification System

| | |
|---|---|
| **Current** | `sendInAppNotification({ userId: "internal_team", ... })` — hardcoded string |
| **Expected** | Resolve real user IDs: query `organizationMembers` for users with `role = 'admin'` or `role = 'owner'` |
| **Why it matters** | Notifications will never be delivered in production |
| **Rebuild** | Create `NotificationResolver` in `core/notifications.ts` that accepts a role pattern, queries real user IDs, and inserts into a `notifications` table with `userId`, `message`, `read`, `createdAt` |
| **Complexity** | Medium (1 day) |

---

## SECTION 10 — Final Product Readiness

| Module | Expected Completion | Actual Completion | Gap | Production Ready | Enterprise Ready |
|--------|--------------------|--------------------|-----|-----------------|-----------------|
| **Dashboard** | 100% | 5% | 95% | ❌ No | ❌ No |
| **CRM Navigation** | 100% | 35% | 65% | ❌ No | ❌ No |
| **Sales — Leads** | 100% | 60% | 40% | ⚠ Partial | ⚠ Partial |
| **Sales — Pipeline** | 100% | 85% | 15% | ✅ Near | ⚠ Partial |
| **Sales — Proposals** | 100% | 65% | 35% | ⚠ Partial | ⚠ Partial |
| **Organizations / Directory** | 100% | 25% | 75% | ❌ No | ❌ No |
| **Contacts** | 100% | 45% | 55% | ⚠ Partial | ❌ No |
| **Projects** | 100% | 55% | 45% | ⚠ Partial | ❌ No |
| **Tasks** | 100% | 40% | 60% | ❌ No | ❌ No |
| **Deliverables** | 100% | 50% | 50% | ⚠ Partial | ❌ No |
| **Conversion Engine** | 100% | 5% | 95% | ❌ No | ❌ No |
| **Finance** | 100% | 40% | 60% | ❌ No | ❌ No |
| **Client Portal** | 100% | 55% | 45% | ⚠ Partial | ❌ No |
| **Notifications/Inbox** | 100% | 10% | 90% | ❌ No | ❌ No |
| **Automation** | 100% | 20% | 80% | ❌ No | ❌ No |
| **Settings** | 100% | 30% | 70% | ❌ No | ❌ No |
| **OVERALL** | **100%** | **~42%** | **~58%** | ❌ No | ❌ No |

---

## Critical Findings Summary

The five issues below would each individually block a production launch:

1. **🚨 Conversion Engine is dead.** `ProposalAccepted` does not create a project. The core business automation does not exist.
2. **🚨 Client Portal shows wrong data.** Clients see deal stages, not project progress. This is a client-facing data boundary violation.
3. **🚨 Finance module bypasses architecture.** Direct DB calls in billing actions violate the mandatory repository pattern. Financial data integrity is at risk.
4. **🚨 Notifications are non-functional.** Hardcoded userId strings mean no real user ever receives a notification.
5. **🚨 Navigation is architecturally misaligned.** The workspace separation mandated by the PRD does not exist — the product is one monolithic CRM screen, not a multi-workspace platform.

---

## Final Verdict

> ❌ **Not Ready for Beta, Let Alone Production**

The Aarotech platform has a functional database layer, a working authentication system, and several solid UI components (Kanban, proposals table, delivery views). However, at a product level, the **core business workflow is broken** (Lead → Deal → Proposal → Project → Invoice → Delivery → Client Approval), the **navigation architecture does not match the approved specification**, and the **client-facing portal shows incorrect data**.

This is an MVP that can be demonstrated as a prototype. It cannot handle a single real client engagement end-to-end without manual workarounds. It requires a focused hardening sprint addressing P0 and P1 issues before any client access should be granted.
