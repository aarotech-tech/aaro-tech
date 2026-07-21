# Aarotech Enterprise Platform — Product Rebuild Roadmap
### Chief Product Architect · Enterprise UX Lead · Technical Program Manager

> **Classification:** Implementation-Ready Master Roadmap
> **Basis:** PRD · TDD · MDP · EEB · EAIG · BCDG · AKB · Product UX Audit
> **Date:** 2026-07-21
> **Rebuild Philosophy:** Refactor over Rewrite. Reuse. Close gaps. Restore intent.

---

## SECTION 1 — Executive Summary

### Current Product Maturity
The Aarotech platform sits at approximately **42% of its intended product specification**. The database schema is well-designed, the authentication layer is solid, and several UI components (Kanban, deliverable reviews, billing tables) are genuinely reusable. However, the platform has structural problems that prevent it from functioning as a unified enterprise product.

### Primary Architectural Problems
1. **No Conversion Engine.** The central automation — `ProposalAccepted → Project + Invoice` — does not execute. The platform cannot automate any deal-to-delivery transition.
2. **No `src/modules/finance/` bounded context.** Finance logic is scattered across `app/actions/billing.ts` using raw Drizzle calls. This violates every rule in the BCDG and EAIG.
3. **`createSafeAction` exists but is inconsistently adopted.** A three-tier wrapper (`actionClient`, `authActionClient`, `tenantActionClient`, `internalActionClient`) is in place and working — but many high-risk actions (billing, project creation) still use raw `"use server"` functions.
4. **No Stripe webhook for `invoice.paid`.** Only the Clerk webhook exists. Finance is blind to incoming payments.

### Primary UX Problems
1. **Dashboard is the Sales Pipeline.** The `/crm` entry point renders a Kanban board, not an executive command center.
2. **Navigation is a monolithic CRM sidebar.** There are no workspace-separated navigation zones as the PRD mandates.
3. **Client Portal shows deal data instead of project data.** Clients see internal sales stage information.
4. **No topbar, no breadcrumbs, no global search, no notification bell.**
5. **Duplicate pages** for Projects and Pipeline exist across route groups with no canonical source.

### Primary Workflow Problems
1. **Lead → Deal → Proposal → Project pipeline is broken at the Proposal acceptance step.**
2. **InvoicePaid does not unblock Projects** from `pending_deposit` → `active`.
3. **Notifications fire to hardcoded string IDs**, never reaching real users.
4. **Client Portal onboarding wizard does not exist** despite DB tables being in place.

### Overall Rebuild Strategy
**"Close the gaps, restore the intent."**
- Do NOT rewrite what works: KanbanBoard, DeliveryService, ProposalActions, ReviewActions, safe-action wrapper, DB schema, Clerk auth, UploadThing integration.
- DO refactor: Navigation structure, finance module, billing actions, portal dashboard, event handlers.
- DO build net-new: Executive Dashboard, Conversion Engine handler, Finance module, Notification resolver, `/inbox` page, `/delivery/reviews`, Directory workspace, Settings pages, Stripe webhook.

### Estimated Implementation Effort
| Category | Effort |
|----------|--------|
| Critical P0 fixes | 3–4 days |
| Navigation rebuild | 2–3 days |
| Dashboard | 1–2 days |
| Conversion Engine | 1–2 days |
| Finance module refactor | 2–3 days |
| Directory workspace | 2 days |
| Delivery workspace gaps | 2 days |
| Portal fixes | 1–2 days |
| Notifications system | 2 days |
| Settings completion | 1 day |
| Testing + hardening | 3–5 days |
| **Total** | **~22–30 working days** |

---

## SECTION 2 — Product Vision

### Final Product After Rebuild

Aarotech is a **unified, role-aware, multi-workspace enterprise platform** for digital agencies. It eliminates disconnected tools by providing one system that handles the complete client lifecycle: from the moment a website visitor submits a lead, through deal negotiations, contract signing, project delivery, client approvals, and final payment — with full audit trails, event-driven automation, and a client-facing portal that inspires confidence.

### User Roles
| Role | Workspace Access | Portal Access |
|------|-----------------|---------------|
| **Owner / Admin** | All workspaces + System settings | — |
| **Sales** | Sales workspace, Directory (read), Finance (read) | — |
| **Project Manager** | Delivery workspace, Directory (read), Finance (read) | — |
| **Finance Officer** | Finance workspace, Directory (read) | — |
| **Client Admin** | — | Full Client Hub |
| **Client Member** | — | Reviews + Documents only |

### Primary Workspaces
1. **Dashboard** — Executive command center for Owners/Admins
2. **Sales** — Pre-sales pipeline: Leads, Deals, Proposals
3. **Delivery** — Post-sales execution: Projects, Tasks, Reviews
4. **Finance** — Revenue management: Invoices, Payments, Retainers
5. **Directory** — Master records: Organizations, Contacts
6. **Client Hub** — External portal for client approval and billing
7. **System** — Settings, Team, Services, Automation logs

### Navigation Philosophy
**Workspace-first.** Each workspace has its own sidebar, its own purpose, and its own user. The global topbar provides cross-workspace utilities: search, notifications, user menu, and workspace switcher. No workspace bleeds into another's sidebar.

### Product Principles (from AKB)
- Native Tenant Isolation at every query level
- Event-Driven side effects — UI never waits for background work
- CRUD++ over basic CRUD — every entity has a full enterprise lifecycle
- Single Source of Truth — no duplicate pages, no parallel statuses

### Enterprise UX Goals
- Every page loads in < 1 second (p95)
- Every list has: loading skeleton, empty state with CTA, error state with retry
- Every mutation has: loading button, success toast, error toast with actionable message
- Every destructive action has: confirmation dialog, undo window (10s)
- Fully keyboard navigable (Cmd+K, shortcuts, Tab focus)

---

## SECTION 3 — Target Information Architecture

### Complete Route Structure

```
/ (Admin Root)
├── /                           → Executive Dashboard
├── /inbox                      → Notification Center

├── /sales/
│   ├── /sales/leads            → Website Leads (websiteLeads table)
│   ├── /sales/pipeline         → Deal Kanban Board
│   └── /sales/proposals        → Proposals List
│       └── /sales/proposals/[id] → Proposal Editor + Send + Preview

├── /delivery/
│   ├── /delivery               → Delivery Command Center (KPIs)
│   ├── /delivery/projects      → All Active Projects
│   │   └── /delivery/projects/[id] → Project Detail (Tabs: Overview, Tasks, Deliverables, Activity)
│   ├── /delivery/tasks         → Cross-project Task Board (assignee view)
│   └── /delivery/reviews       → Global Deliverables Review Queue

├── /finance/
│   ├── /finance                → Revenue Command Center
│   ├── /finance/invoices       → Invoice List
│   │   └── /finance/invoices/[id] → Invoice Detail + Payment History
│   ├── /finance/payments       → Payment Ledger
│   └── /finance/retainers      → Retainer Management

├── /directory/
│   ├── /directory/organizations → Organizations List
│   │   └── /directory/organizations/[id] → Org Profile (Contacts, Deals, Projects, Invoices)
│   └── /directory/contacts     → Contacts Directory

├── /settings/
│   ├── /settings               → Settings Overview
│   ├── /settings/profile       → User Profile
│   ├── /settings/team          → Team Members + RBAC roles
│   ├── /settings/services      → Service Catalog
│   └── /settings/system        → Agency Branding, Tax, Integrations

└── /automations/               → Background Job Monitor

/portal/ (Client Hub Root — separate auth context)
├── /portal/home                → Client Dashboard (projects, pending actions)
├── /portal/reviews             → Deliverables awaiting approval
├── /portal/billing             → Invoice list + Pay Now
├── /portal/documents           → Signed contracts + assets
└── /portal/settings            → Client account settings
```

### Route Specification

| Route | Purpose | Primary Users | Main Actions | Dependencies |
|-------|---------|---------------|-------------|--------------|
| `/` | Executive KPIs, activity, revenue | Owner, Admin | Navigate, Quick Create | All modules |
| `/inbox` | All system notifications | All internal | Mark read, Navigate to entity | Core notifications |
| `/sales/leads` | Website lead management | Sales | Qualify, Archive, Import | `websiteLeads` table |
| `/sales/pipeline` | Deal Kanban | Sales | Drag, Create Deal, Open Proposal | `deals` table |
| `/sales/proposals` | Proposal management | Sales | Create, Send, Duplicate | `proposals`, `deals` |
| `/sales/proposals/[id]` | Proposal editor | Sales | Edit content, line items, Send | TipTap, LineItems |
| `/delivery` | Delivery overview | PM, Admin | Navigate, see at-risk projects | `projects`, `tasks` |
| `/delivery/projects` | Project list | PM | Create (manual), Filter | `projects` |
| `/delivery/projects/[id]` | Project workspace | PM | Add Task, Upload Deliverable, Activity | All delivery entities |
| `/delivery/tasks` | My tasks / cross-project | PM, Staff | Complete, Assign, Filter | `tasks` |
| `/delivery/reviews` | Review queue | PM | Submit for Review, View status | `deliverables` |
| `/finance` | Revenue overview | Finance, Admin | Navigate, see outstanding | `invoices`, `payments` |
| `/finance/invoices` | Invoice list | Finance | Create, Filter by status | `invoices` |
| `/finance/invoices/[id]` | Invoice detail | Finance | Mark Paid, Void, Download PDF | `payments` |
| `/finance/payments` | Payment ledger | Finance | Record manual, Filter | `payments` |
| `/finance/retainers` | Retainer contracts | Finance | Create, Manage periods | `retainers` |
| `/directory/organizations` | Org master list | All internal | Create Org, Filter, Export | `organizations` |
| `/directory/organizations/[id]` | Org profile | All internal | View all linked entities | All entity types |
| `/directory/contacts` | Contacts list | Sales, Admin | Add Contact, Assign to Org | `contacts` |
| `/settings/team` | Team management | Admin, Owner | Invite, Set role, Deactivate | Clerk, `users` |
| `/settings/services` | Service catalog | Admin | Create/Edit services | `services` |
| `/portal/home` | Client dashboard | Client | Navigate, see pending items | `projects`, `invoices` |
| `/portal/reviews` | Approval queue | Client | Approve, Request Changes | `deliverables` |
| `/portal/billing` | Client billing | Client | Pay Now, Download receipt | `invoices`, `payments` |
| `/portal/documents` | Documents | Client | Download, View proposals | `proposals`, `clientAssets` |

---

## SECTION 4 — Workspace Redesign

### 4.1 Dashboard (/)

**Purpose:** The executive pulse of the business. First screen on login for Admin/Owner.

**KPI Cards (Row 1):**
- Active Projects (count, with "↑2 this week" trend)
- Open Invoices (total value in currency)
- Pipeline Value (sum of all non-Won/Lost deals)
- Tasks Due Today (count, with overdue highlighted red)

**Charts (Row 2):**
- Monthly Revenue chart (bar chart: last 6 months collected vs billed)
- Pipeline by Stage (horizontal bar showing deal count/value per stage)

**Panels (Row 3):**
- Recent Activity feed (last 15 `activityLogs`, grouped by day)
- Upcoming: tasks due in next 7 days + invoice due dates

**Quick Actions:** `+ New Deal`, `+ New Invoice`, `+ New Project`, `+ New Contact`

**Permissions:** Owner, Admin

**Data Sources:** Aggregation queries across `projects`, `invoices`, `deals`, `tasks`, `activityLogs`

---

### 4.2 Sales Workspace

**Purpose:** Manage the pre-sales lifecycle from first contact to signed contract.

**Pages:** `/sales/leads`, `/sales/pipeline`, `/sales/proposals`

**Navigation (Sales Sidebar):**
```
Sales
  ├── Leads
  ├── Pipeline
  └── Proposals
```

**Primary Workflows:**
1. New website lead arrives → `websiteLeads` table → Sales qualifies → `qualifyLead()` creates Org + Contact + Deal → Deal appears on Pipeline
2. Deal advances through Kanban stages → Reaches "Proposal" stage → Proposal created → Sent to Client → Client signs → `ProposalAccepted` event fires

**KPIs (Pipeline page header):**
- Deals in Pipeline: count
- Total Pipeline Value: $
- Win Rate (won / total closed)
- Avg Deal Close Time (days)

**Quick Actions:** `+ New Lead` (manual), `+ New Deal`, `Promote Lead` (from lead row)

**Permissions:** Read/Write for Sales + Admins. No access for Client Portal users.

---

### 4.3 Delivery Workspace

**Purpose:** Execute active client engagements. Operations team's home.

**Pages:** `/delivery`, `/delivery/projects`, `/delivery/projects/[id]`, `/delivery/tasks`, `/delivery/reviews`

**Navigation (Delivery Sidebar):**
```
Delivery
  ├── Overview
  ├── Projects
  ├── My Tasks
  └── Review Queue
```

**Project Detail Page Tabs:**
1. **Overview** — Project header (name, client, status, health, progress bar), Budget Burn, timeline
2. **Tasks** — DataTable with columns: Title, Assignee, Status, Priority, Due Date. Task Drawer on click.
3. **Deliverables** — Gallery view. Card per deliverable: thumbnail, version, status badge. Upload button.
4. **Activity** — ActivityTimeline component showing all project events

**KPIs (Delivery Overview page):**
- Projects at Risk (health = red)
- Deliverables Awaiting Review
- Overdue Tasks
- Completed This Month

**Quick Actions:** `+ New Task` (shortcut: `c`), `+ Upload Deliverable`, `Change Health`

**Permissions:** Read/Write for PM + Admins. Read-only for Sales (contextual, via project link from deal).

---

### 4.4 Finance Workspace

**Purpose:** Manage all accounts receivable, payment recording, and retainer billing.

**Pages:** `/finance`, `/finance/invoices`, `/finance/invoices/[id]`, `/finance/payments`, `/finance/retainers`

**Navigation (Finance Sidebar):**
```
Finance
  ├── Overview
  ├── Invoices
  ├── Payments
  └── Retainers
```

**Finance Overview KPIs:**
- Total Revenue (MTD, YTD)
- Outstanding Receivables
- Overdue Invoices (count + value)
- MRR from Retainers

**Invoice Detail Page:**
- Invoice header (client, amount, status, due date)
- Line items breakdown
- Payment history timeline
- Actions: Mark Paid (manual), Void, Download PDF, Send Reminder

**Permissions:** Strict — Finance Officers + Admins only.

---

### 4.5 Directory Workspace

**Purpose:** Master registry of all organizational relationships. The root tenant data.

**Pages:** `/directory/organizations`, `/directory/organizations/[id]`, `/directory/contacts`

**Organization Profile Page sections:**
- Header: Name, Status Badge (Lead/Prospect/Client/Archived), Health Score
- Tabs: Overview, Contacts, Deals, Projects, Invoices, Activity
- Overview: Address, Tax ID, Industry, Created Date

**Contacts List:** Searchable table. Columns: Name, Email, Phone, Organization, Role. Filter by organization.

**Permissions:** All internal users (read), Admin + Sales (write).

---

### 4.6 Client Hub (/portal)

**Purpose:** Frictionless external interface for clients to review work and pay bills.

**Home Page:**
- Welcome message with org name
- **Pending Actions widget** (most prominent): "You have 2 deliverables to approve" + "1 invoice overdue"
- Project status cards (from `projects` table — NOT deals)
- Outstanding invoice summary

**Reviews Page (`/portal/reviews`):**
- List of all `deliverables` with `status = 'in_review'` for the client's org
- Card per deliverable: file preview, version badge, submitted date
- Clicking opens full deliverable view with file, comment thread, Approve / Request Changes split button

**Billing Page (`/portal/billing`):**
- Invoice table: ID, Amount, Status, Due Date, Actions
- "Pay Now" button → Opens Razorpay/Stripe payment flow
- Paid invoices show "Download Receipt" link

**Documents Page (`/portal/documents`):**
- Signed proposals (PDF link)
- Client assets (uploaded by agency)

**Design:** Dark theme (current dark portal design is correct and should be kept)

---

### 4.7 Automation (/automations)

**Purpose:** Observability of background jobs. Not a configuration UI (V1).

**Current state is acceptable as a passive log viewer.** No rebuild needed — only fix the actual job triggers.

---

### 4.8 Notifications (/inbox)

**Purpose:** Central notification center for all system-generated alerts.

**Topbar:** Bell icon with unread badge count (polling every 30s via SWR)

**Inbox Page:**
- List of notifications grouped by date
- Each notification: Icon (type), Message, Entity link, Timestamp, Read/Unread state
- "Mark all read" bulk action

**Notification Types:**
- Proposal accepted by client
- Invoice payment received
- Deliverable approved/rejected
- Task assigned to you
- Project status changed

---

### 4.9 Settings (/settings)

**Pages to build:**
- `/settings/profile` — Name, avatar, email (Clerk-managed)
- `/settings/team` — List of all users in agency, invite, set role (Owner/Admin/Sales/PM/Finance)
- `/settings/services` — Service catalog CRUD (already partially exists at wrong path)
- `/settings/system` — Agency name, logo, tax settings, default currency

---

## SECTION 5 — Workflow Rebuild

### WF-1: Lead Capture → Deal Creation

**Current:** Two separate lead systems. `/sales/leads` fetches `organizations`. `/crm/leads` fetches `websiteLeads`. Calling `qualifyLead()` creates an Org+Contact+Deal correctly but the UI trigger is broken.

**Problems:** Identity confusion. Two pages claiming to show "Leads" showing different entities.

**Expected:**
```
websiteLeads table (external form submissions)
→ /sales/leads page (shows websiteLeads)
→ "Qualify" action → qualifyLead() → creates Organization + Contact + Deal
→ Deal appears on /sales/pipeline Kanban
→ websiteLeads record updated to status: "qualified"
```

**Rebuild Steps:**
1. Fix `/sales/leads/page.tsx` to query `websiteLeads` table (not `organizations`)
2. Add "Qualify" button to each lead row that calls existing `qualifyLead()` service
3. Show success state: "Lead qualified → Deal created: [Deal Name]"
4. Remove `/crm/leads` as a duplicate (consolidate into `/sales/leads`)

**Acceptance Criteria:**
- Website lead in `websiteLeads` table appears on `/sales/leads`
- Clicking "Qualify" creates an Organization, Contact, and Deal atomically
- New Deal is immediately visible on `/sales/pipeline`
- `websiteLeads.status` updates to `"qualified"`

---

### WF-2: Deal → Proposal → Client Signing

**Current:** Proposal creation works. Sending works (partially). Signature capture works. BUT `approveProposalByToken()` does NOT create a Project.

**Expected:**
```
Deal on Pipeline (stage: "proposal")
→ "Create Proposal" action → Proposal editor (/sales/proposals/[id])
→ "Send to Client" → magic link generated → email sent to client
→ Client signs → approveProposalByToken() executes in SalesService
→ ProposalAccepted event emitted
→ Event handler: Deal updated to "won" + Project created + Deposit Invoice created
→ PM and Sales Rep notified with real user IDs
```

**Rebuild Steps:**
1. In `src/modules/core/events.ts`, add `ProposalAccepted` handler that calls:
   - `SalesRepository.updateDealStage(dealId, 'won')`
   - `DeliveryService.createProjectFromDeal(dealId, proposalId)` — which calls existing `createManualProject()` logic
   - `FinanceService.createDepositInvoice(organizationId, projectId, amount)`
   - `NotificationService.notifyRole('admin', '...')` and `notifyRole('pm', '...')`
2. All of this inside a **DB transaction** to ensure atomicity
3. On failure: log to `automationLogs` with `status: "failed"` for admin visibility

**Acceptance Criteria:**
- Signing a proposal creates a Project in `projects` table within 2 seconds
- Project status is `"pending_deposit"` (not `"active"`)
- A Deposit Invoice is created in `invoices` table with correct amount
- Activity log records `ProposalAccepted` for the organization
- Sales Rep and relevant Admins receive an in-app notification

---

### WF-3: Invoice → Payment → Project Activation

**Current:** `markInvoicePaidManuallyAction()` inserts a payment and updates invoice status but emits no event and does not update any Project.

**Expected:**
```
Invoice status = "open"
→ Client pays (Razorpay/Manual UTR submission)
→ Internal staff marks paid / Webhook receives payment confirmation
→ InvoicePaid event emitted
→ Event handler: Find associated Project via invoice.projectId
→ Update project.status from "pending_deposit" → "active"
→ PM notified: "Deposit received for [Project Name]. Work can begin."
```

**Rebuild Steps:**
1. Add Stripe/Razorpay webhook handler at `/api/webhooks/razorpay` (or `/api/webhooks/stripe`)
2. On `payment_captured` event → call `markInvoicePaidManuallyAction()` with verified amounts
3. In `markInvoicePaidManuallyAction()`, add: `emitDomainEvent({ type: "InvoicePaid", ... })`
4. In `events.ts`, add `InvoicePaid` handler:
   - Query `invoices` for `projectId`
   - If exists, update `projects.status = 'active'`
   - Notify PM role

**Acceptance Criteria:**
- Recording a manual payment on an invoice with a linked project transitions project to `"active"`
- Stripe/Razorpay webhook correctly marks invoice paid
- PM receives notification: "Project [Name] is now active"
- `activityLogs` records the transition

---

### WF-4: Project → Deliverable → Client Review

**Current:** PM-side upload exists. Client-side approval exists. Missing: Global review queue for PMs.

**Expected:**
```
PM uploads file to Deliverable (UploadThing)
→ PM clicks "Submit for Review"
→ DeliverableService.submitDeliverableForReview() updates status → "in_review"
→ DeliverableReviewRequested event fired
→ Client notified via email + in-app notification
→ Client visits /portal/reviews
→ Client approves → DeliverableApproved event
→ Delivery team notified
→ Deliverable.status = "approved", version locked
```

**Rebuild Steps:**
1. Build `/delivery/reviews` page showing all `deliverables WHERE status = 'in_review'` across all org's projects
2. Ensure email template fires on `DeliverableReviewRequested` via `Resend`
3. Fix `events.ts` `DeliverableApproved` handler to notify real PM user IDs (not hardcoded string)

**Acceptance Criteria:**
- PM can see all in-review deliverables on `/delivery/reviews`
- Client receives email notification when deliverable is submitted
- Approval by client immediately reflects in PM's view
- Approved versions are locked (no further edits, only new version upload)

---

### WF-5: Client Portal Onboarding

**Current:** DB tables exist (`clientOnboardings`, `onboardingSteps`). No UI in portal.

**Expected:**
```
Deal Won → Project created → Client user invited (Clerk invitation)
→ Client receives magic link email
→ Client logs in → /portal/home
→ If onboarding incomplete: Onboarding checklist is prominent on home page
→ Steps: (1) Verify contact info, (2) Provide brand assets, (3) Sign proposal (if not yet signed)
→ On completion → normal portal dashboard
```

**Rebuild Steps:**
1. Add onboarding check to `/portal/home`: if `clientOnboardings.status !== 'completed'`, show checklist
2. Render `onboardingSteps` as a step-by-step wizard component
3. Mark steps complete as client progresses

---

## SECTION 6 — Module Rebuild Plan

### Module: Core

**Purpose:** Auth, safe actions, event bus, notifications, DB connection.

**Current State:** Solid. `safe-action.ts` has 4 tiers (base, auth, tenant, internal). Events exist. Activity logging works. Notifications fire but to wrong user IDs.

**Target State:** Notifications resolve real user IDs. Events trigger Conversion Engine logic.

**Files Affected:**
- `src/modules/core/events.ts` — Add `ProposalAccepted`, `InvoicePaid` handlers with real project/invoice logic
- `src/modules/core/notifications.ts` — Add `notifyRole(role, orgId, message)` that queries `organizationMembers` + `users` for real IDs

**Database Changes:** Add `notifications` table: `id, userId, message, entityType, entityId, read, createdAt`

**Architecture Changes:** Events must call cross-module services. Add `DeliveryService` and `FinanceService` calls from within event handlers (import from modules, not from `app/`).

**Definition of Done:**
- `ProposalAccepted` creates Project + Invoice in DB transaction
- `InvoicePaid` transitions Project to active
- Notifications reach real user IDs in `notifications` table
- Unit tests for each event handler

---

### Module: Finance (NET NEW)

**Purpose:** Owns all revenue collection: Invoices, Payments, Retainers.

**Current State:** Logic split across `app/actions/billing.ts` (raw Drizzle) and `crm/finance/` and `crm/billing/`. No service or repository layer. No bounded context.

**Target State:** Full DDD bounded context at `src/modules/finance/`.

**Files to Create:**
- `src/modules/finance/repositories.ts` — `findInvoiceById(id, orgId)`, `createInvoice(data)`, `voidInvoice(id)`, `findPaymentsByInvoice(invoiceId)`, `recordPayment(data)`
- `src/modules/finance/services.ts` — `createInvoice()`, `voidInvoice()`, `recordManualPayment()`, `createDepositInvoice()` (used by Conversion Engine)
- `src/modules/finance/actions.ts` — Safe action wrappers using `internalActionClient`
- `src/modules/finance/validation.ts` — Zod schemas: `CreateInvoiceSchema`, `RecordPaymentSchema`

**Files to Refactor:**
- `src/app/actions/billing.ts` → Replace raw `db.*` calls with `FinanceService.*` calls
- `/finance/` pages → Update imports to use new finance actions

**Pages to Build:**
- `/finance/page.tsx` — Revenue Command Center with KPI cards
- `/finance/invoices/page.tsx` — Invoice DataTable with filters
- `/finance/invoices/[id]/page.tsx` — Invoice detail with payment history
- `/finance/payments/page.tsx` — Payment ledger
- `/finance/retainers/page.tsx` — Retainer management

**Architecture Changes:** Finance module must NOT import from Delivery module. Communication via events only.

**Definition of Done:**
- All billing mutations go through `FinanceService`
- `createDepositInvoice()` callable from Conversion Engine event handler
- Integration tests for invoice create, void, mark paid

---

### Module: Navigation & Shell (REFACTOR)

**Purpose:** Restore the workspace-based navigation architecture from the PRD.

**Current State:** Single monolithic sidebar under `/crm/` serving all workspaces.

**Target State:** Each workspace has its own layout with its own sidebar nav.

**Files to Create/Refactor:**
- `src/app/(admin)/layout.tsx` — Global admin shell: topbar (search, notification bell, user menu) + workspace switcher
- `src/app/(admin)/sales/layout.tsx` — Sales sidebar nav (Leads, Pipeline, Proposals)
- `src/app/(admin)/delivery/layout.tsx` — Delivery sidebar nav (Overview, Projects, Tasks, Reviews)
- `src/app/(admin)/finance/layout.tsx` — Finance sidebar nav (Overview, Invoices, Payments, Retainers)
- `src/app/(admin)/directory/layout.tsx` — Directory sidebar nav (Organizations, Contacts)
- `src/app/(admin)/settings/layout.tsx` — Settings sidebar nav (Profile, Team, Services, System)
- `src/components/layout/Topbar.tsx` — Global topbar with search + notification bell + user menu
- `src/components/layout/WorkspaceSwitcher.tsx` — The top-of-sidebar component for switching workspaces

**Route Cleanup:** Remove or redirect the obsolete `/crm/*` routes to their canonical workspace equivalents. Use Next.js `redirect()` in `page.tsx` files for any routes that must remain for backward compatibility.

**Definition of Done:**
- Each workspace has its own isolated sidebar
- Topbar is persistent across all admin pages
- No `/crm/*` routes in the active sidebar
- Workspace switcher allows quick navigation between Sales/Delivery/Finance/Directory

---

### Module: Dashboard (NET NEW)

**Purpose:** Executive command center at `/`.

**Current State:** `/crm/page.tsx` renders a Kanban board.

**Target State:** Aggregated executive view.

**Files to Create:**
- `src/app/(admin)/page.tsx` — Executive Dashboard RSC
- `src/components/shared/StatCard.tsx` — Reusable KPI card (value, label, trend, icon)
- `src/components/shared/ActivityFeed.tsx` — Recent activity list from `activityLogs`
- `src/components/shared/RevenueChart.tsx` — Monthly revenue bar chart (client component, use `recharts`)

**Data Sources:** Direct aggregation queries in the RSC (no caching for V1 alpha, add Redis in hardening sprint):
- `COUNT projects WHERE status = 'active'`
- `SUM invoices WHERE status = 'open'`
- `SUM deals WHERE status NOT IN ('won','lost')`
- Last 15 `activityLogs` ordered by `createdAt DESC`

**Definition of Done:**
- Dashboard renders 4 KPI cards with real data
- Revenue chart shows last 6 months
- Recent activity feed shows last 15 events
- Quick create buttons navigate to correct workspace create flows

---

### Module: Directory (NET NEW)

**Purpose:** Master organizational data browser.

**Current State:** `Clients` page exists under `/crm/clients/` showing only `type = 'client'` orgs. No dedicated Directory workspace.

**Target State:** Full Directory workspace at `/directory/`.

**Files to Create:**
- `src/app/(admin)/directory/layout.tsx`
- `src/app/(admin)/directory/organizations/page.tsx` — All orgs DataTable (all types: lead/prospect/client/archived). Filters by type/status.
- `src/app/(admin)/directory/organizations/[id]/page.tsx` — Org profile with tabs: Contacts, Deals, Projects, Invoices, Activity
- `src/app/(admin)/directory/contacts/page.tsx` — All contacts DataTable with org link

**Reuse:** The existing `/crm/clients/[clientId]/` detail page logic can be ported to `/directory/organizations/[id]`

**Definition of Done:**
- All organizations visible in one place regardless of lifecycle status
- Organization profile shows all linked entities
- Contacts searchable and filterable by organization

---

### Module: Sales (REFACTOR)

**Purpose:** Clean up duplicates, fix lead entity, consolidate routes.

**Current State:** Functional Kanban pipeline at `/sales/pipeline`. Broken leads page at `/sales/leads`. Duplicate proposals at `/crm/proposals`. 

**Target State:** Three clean pages under `/sales/` only. No `/crm/` equivalents.

**Files to Refactor:**
- `src/app/(admin)/sales/leads/page.tsx` — Change query from `organizations` to `websiteLeads`. Add Qualify button.
- `src/app/(admin)/sales/proposals/page.tsx` — Move from `/crm/proposals` to `/sales/proposals`. Keep the table logic.
- `src/app/(admin)/sales/proposals/[id]/page.tsx` — Move from `/crm/proposals/[id]`. Keep all existing components (LineItemsEditor, ProposalActions).

**Pipeline page is KEEP AS IS** — PipelineBoard.tsx is solid. Only needs the layout refactor to live under proper Sales workspace nav.

**Definition of Done:**
- `/sales/leads` shows `websiteLeads` records
- Qualifying a lead creates Org + Contact + Deal (calls existing `qualifyLead()`)
- `/sales/proposals/[id]` has full proposal editor with line items + send button
- Zero `/crm/` route duplicates for Sales entities

---

### Module: Delivery (AUGMENT)

**Purpose:** Close the gaps in the delivery workspace.

**Current State:** `DeliveryService` is solid. `approveDeliverable()`, `requestDeliverableRevision()`, `createManualProject()` all work. Project detail exists. Missing: `/delivery/reviews`, full task drawer, delivery command center.

**Target State:** Full 4-page delivery workspace.

**Files to Create:**
- `src/app/(admin)/delivery/page.tsx` — Delivery Command Center (KPI cards for at-risk projects, overdue tasks, deliverables in review)
- `src/app/(admin)/delivery/reviews/page.tsx` — Global deliverables review queue (all `in_review` deliverables across projects for internal team)
- `src/app/(admin)/delivery/tasks/page.tsx` — Cross-project task list (currently exists at wrong path, move from `/crm/tasks`)
- `src/components/delivery/TaskDrawer.tsx` — Slide-in panel for task detail/edit (URL param managed: `?taskId=xxx`)

**Files to Refactor:**
- Project detail page `[id]/page.tsx` — Add proper tab navigation (Overview, Tasks, Deliverables, Activity). Currently exists at `/crm/projects/[id]` — needs to move to `/delivery/projects/[id]`.

**Definition of Done:**
- `/delivery/reviews` shows all in-review deliverables with submit/recall actions
- Task drawer opens on click, allows status change and assignee update
- Project detail has 4 tabs all populated with real data

---

### Module: Client Portal (FIX)

**Purpose:** Fix critical data error and add missing pages.

**Current State:** Home fetches `deals` not `projects`. Missing `/portal/reviews`, `/portal/documents`, `/portal/settings`.

**Files to Fix:**
- `src/app/(client)/portal/page.tsx` — Replace `deals.findMany` with `projects.findMany(where: orgId)`. Fix "Total Investment" to use `projects.value`.

**Files to Create:**
- `src/app/(client)/portal/reviews/page.tsx` — List of `deliverables WHERE organizationId = clientOrgId AND status = 'in_review'`
- `src/app/(client)/portal/documents/page.tsx` — List `proposals WHERE status = 'accepted'` + `clientAssets`
- `src/app/(client)/portal/settings/page.tsx` — Client account settings (contact info, notification preferences)

**Definition of Done:**
- Portal home shows real project data (status, health, progress)
- Client can see and approve all pending deliverables at `/portal/reviews`
- Documents page shows all signed contracts and uploaded assets
- Account Health is computed, not hardcoded

---

### Module: Notifications (REBUILD)

**Purpose:** Deliver real in-app notifications to real users.

**Current State:** `notificationService.sendInAppNotification({ userId: "internal_team", ... })` — non-functional.

**Target State:** Dynamic role-based notification dispatch backed by a `notifications` table.

**Database Change:** Create `notifications` table:
```
id          uuid PK
userId      uuid FK users.id NOT NULL
orgId       uuid (for tenant scoping)
message     text NOT NULL
entityType  varchar(50)
entityId    uuid
read        boolean DEFAULT false
createdAt   timestamp DEFAULT now()
```

**Files to Create/Refactor:**
- `src/modules/core/notifications.ts` — Replace `sendInAppNotification` with:
  ```
  notifyRole(role: string, orgId: string, message: string, entity?)
  notifyUser(userId: string, message: string, entity?)
  ```
  These query `users WHERE role = ? AND org matches`, then insert into `notifications` table.
- `src/app/(admin)/inbox/page.tsx` — Notifications list
- `src/components/layout/NotificationBell.tsx` — Topbar bell icon with unread count (polling via `fetch` every 30s)
- `src/app/api/notifications/route.ts` — Lightweight GET endpoint returning unread count for polling

**Definition of Done:**
- Admin receives in-app notification when client approves a deliverable
- Sales rep receives notification when proposal is signed
- `/inbox` page lists all notifications with read/unread state
- Bell icon shows live unread count

---

## SECTION 7 — Navigation Rebuild

### Sidebar Architecture

Each workspace renders its own isolated sidebar. The workspace switcher at the top allows switching between workspaces without losing the current sidebar context.

```
┌─────────────────────────────────────────────────┐
│  [⚡ Aarotech]    [Workspace Switcher ▼]          │  ← Topbar
├─────────────────────────────────────────────────┤
│  [Sales Sidebar]       │   [Main Content]         │
│  ─────────────────     │                          │
│  ✦ Dashboard (/)       │                          │
│  ─ Sales ─────────     │                          │
│    Leads               │                          │
│    Pipeline            │                          │
│    Proposals           │                          │
│                        │                          │
│  ─ System ─────────    │                          │
│    Automations         │                          │
│    Settings            │                          │
└────────────────────────┴──────────────────────────┘
```

### Topbar Components
```
[⚡ Logo]  [Workspace: Sales ▼]  ────────────  [🔍 Search]  [🔔 3]  [👤 Aaron ▼]
```

- **Logo** → links to `/` (Dashboard)
- **Workspace Switcher** → dropdown: Sales, Delivery, Finance, Directory
- **Global Search** → opens Command Palette (Cmd+K) using existing `global-search.tsx`
- **Notification Bell** → badge with unread count, links to `/inbox`
- **User Menu** → Profile, Settings, Sign Out

### Breadcrumbs
Every page renders breadcrumbs below the topbar:
```
Sales / Proposals / Acme Corp Q3 Proposal
```
Implemented as a `<Breadcrumbs>` server component receiving the current route segments.

### Command Palette (Cmd+K)
Existing `global-search.tsx` component exists — wire it:
- Open with `Cmd+K`
- Search across: Organizations, Deals, Projects, Contacts, Invoices
- Quick actions: "Create Deal", "New Invoice", "Go to Settings"

### Quick Create Menu
`+` floating button in topbar (or sidebar footer):
- New Lead
- New Deal
- New Invoice
- New Task

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open Command Palette |
| `c` | Create new task (when on project detail) |
| `Esc` | Close drawer / dialog |
| `g d` | Go to Dashboard |
| `g s` | Go to Sales Pipeline |
| `g p` | Go to Projects |

---

## SECTION 8 — Dashboard Redesign

### Layout (3-zone grid)

```
┌────────────────────────────────────────────────────────────┐
│  Active Projects    Open Invoices    Pipeline    Due Today  │  ← KPI Row
├────────────────────────┬───────────────────────────────────┤
│  Revenue Chart (6mo)   │    Pipeline by Stage               │  ← Charts Row
│  (Bar: billed/paid)    │    (Horizontal bar per stage)      │
├────────────────────────┼───────────────────────────────────┤
│  Recent Activity Feed  │    Upcoming Deadlines              │  ← Feed Row
│  (Last 15 events)      │    (Tasks + Invoices due < 7d)     │
└────────────────────────┴───────────────────────────────────┘
```

### KPI Card Specification
Each `<StatCard>` receives:
- `label` — e.g., "Active Projects"
- `value` — e.g., `12`
- `trend` — e.g., `{ direction: 'up', value: '2 this week' }`
- `icon` — Lucide icon
- `href` — link to relevant workspace page
- `variant` — `'neutral' | 'success' | 'warning' | 'danger'`

### Revenue Chart
- Library: `recharts` (already likely in dependencies)
- Data: `SUM(invoices.amount) GROUP BY month WHERE status = 'paid'` — last 6 months
- Two series: "Billed" (all invoices) and "Collected" (paid invoices)
- Client component with loading skeleton while data fetches

### Role-Specific Widgets
| Role | Extra Widgets |
|------|--------------|
| Owner/Admin | Full dashboard |
| Sales | Only pipeline value + leads count |
| PM | Only projects + tasks + deliverables in review |
| Finance | Only revenue chart + outstanding invoices |

---

## SECTION 9 — Architecture Alignment

### Changes Required Per Architectural Standard

| Standard | Status | Required Change |
|----------|--------|----------------|
| **DDD Bounded Contexts** | ⚠ Partial | Create `src/modules/finance/`. Finance logic must leave `app/actions/billing.ts`. |
| **Repository Pattern** | ⚠ Partial | `billing.ts` must call `FinanceRepository`, not raw `db.*`. |
| **Service Layer** | ✅ Exists for Sales/Delivery | Add `FinanceService`. Conversion Engine calls `DeliveryService.createProjectFromDeal()`. |
| **Server Actions (Safe)** | ⚠ Partial | `billing.ts` uses raw `"use server"`. Must migrate to `internalActionClient`. |
| **Event-Driven Architecture** | ⚠ Partial | `emitDomainEvent` exists but handlers are hollow. Add real logic to `ProposalAccepted` and `InvoicePaid` handlers. |
| **Outbox Pattern** | ❌ Missing | V1 acceptable: use `Promise.resolve().then()` fire-and-forget (current). Log failures to `automationLogs`. True Outbox (DB-based) in V2 with Trigger.dev. |
| **Tenant Isolation** | ✅ Strong | DB schema is correct. Repositories enforce `organizationId`. Maintain strictly. |
| **RBAC** | ⚠ Partial | `requireInternalUser()` works. `requireOrganizationMember()` used in some actions. Add role-specific checks in Finance module. |
| **Notification System** | ❌ Broken | Rebuild with real user ID resolution + `notifications` DB table. |
| **Background Jobs** | ❌ Hollow | Wire Conversion Engine logic into event handlers. Wire Razorpay/Stripe webhook. V2: move to Trigger.dev. |
| **Optimistic Locking** | ❌ Missing | Add `updated_at` check to all update mutations (at least for financial entities in V1). |
| **Audit Logging** | ✅ Exists | `auditLogs` table exists. Ensure every Finance mutation inserts an audit record. |

### Cross-Module Communication Rules (BCDG)
```
app/ → modules/[domain]/actions.ts (only)
modules/[domain]/actions.ts → modules/[domain]/services.ts (only)
modules/[domain]/services.ts → modules/[domain]/repositories.ts (own domain only)
modules/[domain]/services.ts → modules/[other-domain]/services.ts (public interface only)
modules/core/events.ts → can call any module's service (it's the orchestration layer)
```

**Forbidden imports to fix:**
- `billing.ts` calling `db` directly → must call `FinanceService`
- Any page in `app/` calling `db` directly (finance page does this) → must call actions

---

## SECTION 10 — Sprint Plan

### Sprint 0 — Foundation Stabilization (3 days)
**Goal:** Fix the 5 P0 blockers. Nothing else.

**Tasks:**
1. Fix `portal/page.tsx` — change `deals.findMany` to `projects.findMany` *(2 hours)*
2. Create `src/modules/finance/repositories.ts` + `services.ts` + `actions.ts` *(1 day)*
3. Refactor `billing.ts` to use `FinanceService` *(half day)*
4. Add `notifications` table to schema, run migration *(half day)*
5. Rebuild `notificationService` with real user ID resolution *(half day)*

**Exit Criteria:**
- Client portal shows project data ✓
- Invoice creation flows through FinanceService ✓
- Notifications insertable for real users ✓

---

### Sprint 1 — Conversion Engine (2 days)
**Goal:** Close the broken pipeline. Make `ProposalAccepted` create a Project and Invoice automatically.

**Tasks:**
1. Add `ProposalAccepted` handler in `events.ts` that:
   - Calls `SalesRepository.updateDealStage(dealId, 'won')` in transaction
   - Calls `DeliveryService.createManualProject(dealId, name)` in same transaction
   - Calls `FinanceService.createDepositInvoice(orgId, projectId, amount)`
   - Calls `notifyRole('admin', orgId, 'Proposal accepted...')`
2. Add `InvoicePaid` handler in `events.ts` that:
   - Finds project via `invoice.projectId`
   - Updates `project.status = 'active'`
   - Notifies PM role
3. Emit `InvoicePaid` from `markInvoicePaidManuallyAction()`
4. Add Razorpay/Stripe webhook handler at `/api/webhooks/razorpay`
5. Write integration tests for the full conversion flow

**Exit Criteria:**
- Signing a proposal creates a Project in DB ✓
- Marking invoice paid activates the Project ✓
- Integration test: `createProposal → signProposal → verifyProjectCreated` passes ✓

---

### Sprint 2 — Navigation & Shell Rebuild (2 days)
**Goal:** Implement workspace-based navigation architecture.

**Tasks:**
1. Create `src/components/layout/Topbar.tsx` with search, notification bell, user menu
2. Create `src/components/layout/WorkspaceSwitcher.tsx`
3. Create `src/components/layout/Breadcrumbs.tsx`
4. Refactor each workspace layout:
   - `(admin)/sales/layout.tsx` — Sales sidebar
   - `(admin)/delivery/layout.tsx` — Delivery sidebar
   - `(admin)/finance/layout.tsx` — Finance sidebar
   - `(admin)/directory/layout.tsx` — Directory sidebar
   - `(admin)/settings/layout.tsx` — Settings sidebar
5. Create redirect stubs for old `/crm/*` routes → new workspace equivalents
6. Wire `global-search.tsx` to Cmd+K keyboard shortcut

**Exit Criteria:**
- Each workspace has isolated sidebar ✓
- Topbar renders on all admin pages with working notification bell ✓
- Old `/crm/*` routes redirect correctly ✓
- No broken navigation links ✓

---

### Sprint 3 — Dashboard & Inbox (2 days)
**Goal:** Build the executive dashboard and notification center.

**Tasks:**
1. Build `src/app/(admin)/page.tsx` — Executive Dashboard with 4 KPI cards + revenue chart + activity feed
2. Build `src/components/shared/StatCard.tsx`
3. Build `src/components/shared/ActivityFeed.tsx`
4. Build `src/components/shared/RevenueChart.tsx` (recharts, client component)
5. Build `src/app/(admin)/inbox/page.tsx` — Notifications list
6. Build `src/components/layout/NotificationBell.tsx` with polling

**Exit Criteria:**
- Dashboard renders with real data in < 1s ✓
- Inbox shows all unread notifications ✓
- Bell badge updates every 30 seconds ✓

---

### Sprint 4 — Sales Workspace Cleanup (2 days)
**Goal:** Consolidate Sales into 3 clean pages. Fix leads identity issue.

**Tasks:**
1. Fix `/sales/leads/page.tsx` to query `websiteLeads` table
2. Add "Qualify" action to lead row (calls `qualifyLead()` server action)
3. Move `/crm/proposals` → `/sales/proposals` (refactor path, keep component logic)
4. Move `/crm/proposals/[id]` → `/sales/proposals/[id]` (keep all existing editor components)
5. Verify `/sales/pipeline` works in new layout
6. Delete `/crm/` route equivalents (or add redirect stubs)

**Exit Criteria:**
- `/sales/leads` shows website leads (not organizations) ✓
- Qualify action creates Org + Contact + Deal ✓
- Proposal editor fully functional at new path ✓

---

### Sprint 5 — Delivery Workspace Augmentation (2 days)
**Goal:** Add missing Delivery pages. Fix task drawer.

**Tasks:**
1. Build `/delivery/page.tsx` — Delivery Command Center (at-risk projects, review queue counts)
2. Build `/delivery/reviews/page.tsx` — Global review queue (all in-review deliverables)
3. Move `/crm/tasks` → `/delivery/tasks` (refactor path)
4. Build `TaskDrawer.tsx` — URL-param driven (`?taskId=xxx`) slide-in panel for task detail
5. Move `/crm/projects/[id]` → `/delivery/projects/[id]`, add proper tab navigation

**Exit Criteria:**
- PM can see all in-review deliverables in one place ✓
- Task drawer opens on click, allows status and assignee update ✓
- Project detail has 4 functioning tabs ✓

---

### Sprint 6 — Finance Workspace & Directory (2 days)
**Goal:** Build Finance workspace pages. Build Directory workspace.

**Finance Tasks:**
1. Build `/finance/page.tsx` — Revenue Command Center
2. Build `/finance/invoices/page.tsx` — Invoice DataTable (move from `/crm/billing`)
3. Build `/finance/invoices/[id]/page.tsx` — Invoice detail with payment history timeline
4. Build `/finance/payments/page.tsx` — Payment ledger
5. Build `/finance/retainers/page.tsx` — Retainer management

**Directory Tasks:**
1. Build `/directory/organizations/page.tsx` — All orgs DataTable with lifecycle filter
2. Build `/directory/organizations/[id]/page.tsx` — Org profile (port from `/crm/clients/[clientId]`)
3. Build `/directory/contacts/page.tsx` — Contacts DataTable

**Exit Criteria:**
- Finance workspace has all 4 pages with real data ✓
- Directory shows all organizations with status filter ✓
- Organization profile shows linked deals, projects, invoices ✓

---

### Sprint 7 — Client Portal Completion (2 days)
**Goal:** Fix portal home. Add missing portal pages.

**Tasks:**
1. Fix `portal/page.tsx` — projects data, computed health score
2. Build `/portal/reviews/page.tsx` — deliverables approval queue
3. Build `/portal/documents/page.tsx` — signed proposals + client assets
4. Build `/portal/settings/page.tsx` — client account settings
5. Add onboarding checklist to portal home (if `clientOnboardings.status !== 'completed'`)

**Exit Criteria:**
- Portal home shows correct project data (not deals) ✓
- Client can approve deliverables from `/portal/reviews` ✓
- Documents page shows all signed contracts ✓

---

### Sprint 8 — Settings & UX Polish (2 days)
**Goal:** Complete settings pages. Apply UX standards across all pages.

**Tasks:**
1. Build `/settings/profile/page.tsx` — user profile (Clerk-sourced)
2. Build `/settings/system/page.tsx` — agency branding + tax settings
3. Move `/crm/settings/services` → `/settings/services`
4. Add `loading.tsx` skeleton to every data-fetching page
5. Audit all pages for: empty state illustrations, error boundaries, toast notifications
6. Add breadcrumbs to all pages
7. Ensure all DataTables have sort headers and filter inputs

**Exit Criteria:**
- All 4 settings pages functional ✓
- Every list page has loading skeleton ✓
- Every list page has illustrated empty state ✓

---

### Sprint 9 — Testing & Hardening (4 days)
**Goal:** Achieve test coverage. Fix security gaps. Performance tune.

**Tasks:**
1. Integration tests for Conversion Engine (Proposal → Project → Invoice flow)
2. Integration tests for Finance module (create, void, mark paid)
3. Playwright E2E: `Lead → Pipeline → Proposal → Sign → Project Created`
4. Playwright E2E: `Client logs in → Approves Deliverable → PM notified`
5. Playwright E2E: `Client pays invoice → Project activates`
6. Security audit: verify all `app/` server actions use safe action clients
7. N+1 query audit on project detail page (deliverables + tasks + comments)
8. Add Redis caching for dashboard aggregations
9. Run Lighthouse on Client Portal home — achieve > 90 score
10. Deploy migrations to staging, verify Clerk + Razorpay webhooks

**Exit Criteria:**
- All critical user journeys pass E2E tests ✓
- No raw `db.*` calls outside repository layer ✓
- Dashboard loads in < 500ms ✓
- Portal home loads in < 800ms ✓

---

## SECTION 11 — Priority Matrix

### 🔴 P0 — Must fix before any client touches the system

| ID | Task | Effort |
|----|------|--------|
| P0-1 | Fix portal home: projects not deals | 2h |
| P0-2 | Create Finance module (repos + service) | 1d |
| P0-3 | Refactor billing.ts to use FinanceService | 4h |
| P0-4 | Implement ProposalAccepted → Project creation | 1d |
| P0-5 | Implement InvoicePaid → Project activation | 4h |
| P0-6 | Fix notification system (real user IDs + DB table) | 1d |

### 🟠 P1 — Must fix before production

| ID | Task | Effort |
|----|------|--------|
| P1-1 | Build Executive Dashboard | 1d |
| P1-2 | Rebuild navigation (workspace sidebars + topbar) | 2d |
| P1-3 | Build `/delivery/reviews` review queue | 4h |
| P1-4 | Build `/inbox` notification center | 4h |
| P1-5 | Fix `/sales/leads` to show websiteLeads | 2h |
| P1-6 | Build Directory workspace | 2d |
| P1-7 | Build Finance workspace pages | 2d |
| P1-8 | Add Razorpay/Stripe webhook handler | 4h |
| P1-9 | Add loading.tsx to all data pages | 4h |
| P1-10 | Migrate safe action to all finance mutations | 4h |

### 🟡 P2 — Should fix before beta

| ID | Task | Effort |
|----|------|--------|
| P2-1 | Breadcrumbs on all pages | 4h |
| P2-2 | Task Drawer (slide-in panel) | 1d |
| P2-3 | Empty state illustrations + CTAs | 4h |
| P2-4 | DataTable sort + filter on all tables | 1d |
| P2-5 | Client Portal onboarding checklist UI | 1d |
| P2-6 | `/portal/documents` and `/portal/settings` | 4h |
| P2-7 | Complete Settings pages | 4h |
| P2-8 | Command Palette wiring (Cmd+K) | 4h |
| P2-9 | Computed Account Health (not hardcoded) | 2h |
| P2-10 | Bulk table actions (select + floating bar) | 1d |

### 🟢 P3 — Future enhancements (post-V1)

| ID | Task | Effort |
|----|------|--------|
| P3-1 | TipTap WYSIWYG for proposal content | 2d |
| P3-2 | CSV export on all list views | 1d |
| P3-3 | PDF export for invoices | 1d |
| P3-4 | Lead import wizard (CSV) | 2d |
| P3-5 | Real-time notifications (Pusher/WebSockets) | 3d |
| P3-6 | Trigger.dev visual job builder | 5d |
| P3-7 | Presence indicators (who's viewing) | 3d |
| P3-8 | AI proposal drafting | 5d+ |

---

## SECTION 12 — Risk Assessment

### Risk 1: Conversion Engine DB Transaction Failure
**Risk:** If `ProposalAccepted` event creates a Project but Invoice creation fails, the system is in an inconsistent state.
**Probability:** Medium. **Impact:** High.
**Mitigation:** Wrap all Conversion Engine operations in a single `db.transaction()`. If any step fails, the entire transaction rolls back. Log failure to `automationLogs`. Surface the failure on the Automations page with a "Retry" button.

### Risk 2: Data Migration for Route Refactoring
**Risk:** Existing users may have bookmarked `/crm/*` routes. Changing routing causes 404 errors.
**Probability:** Low (internal dogfooding phase). **Impact:** Medium.
**Mitigation:** Add `redirect()` in all deprecated `page.tsx` files pointing to canonical new routes. Keep redirects in place for 30 days post-launch.

### Risk 3: Notification Spam on Rebuild
**Risk:** Adding the real notification system might retroactively fire notifications for old events.
**Probability:** Low. **Impact:** Medium.
**Mitigation:** Insert a `notifications_enabled_at` timestamp in settings. Only emit notifications for events AFTER this timestamp.

### Risk 4: Clerk Webhook Race Condition
**Risk:** When a new user is created in Clerk and the webhook fires, the user may not yet exist in the `users` table when the Conversion Engine tries to notify them.
**Probability:** Low (webhooks are nearly instant). **Impact:** Low.
**Mitigation:** Notification insert uses `ON CONFLICT DO NOTHING` on userId. If userId doesn't exist, skip notification (it will be missed but not crash the system).

### Risk 5: Schema Migration Breaking Changes
**Risk:** Adding the `notifications` table and any new columns requires a migration that must be backward compatible.
**Probability:** Low. **Impact:** High if migration fails in production.
**Mitigation:** All migrations are additive (new tables, new nullable columns). No existing column renames or drops in V1. Test migration in Neon branching before production push. Verify Drizzle migration is reversible.

### Risk 6: Finance Module Refactor Breaking Billing
**Risk:** Refactoring `billing.ts` to use FinanceService could introduce regressions in the existing billing flow.
**Probability:** Medium. **Impact:** High.
**Mitigation:** Write integration tests for the current billing behavior BEFORE refactoring. Run tests after refactoring to confirm parity. Keep `billing.ts` as a thin adapter calling FinanceService — do not rewrite business logic, just redirect calls.

---

## SECTION 13 — Final Product Readiness Roadmap

| Module | Current % | Target % | Effort | Business Impact | Priority | Dependencies |
|--------|-----------|----------|--------|----------------|----------|-------------|
| Core / Events | 60% | 100% | 2d | 🔴 Critical | P0 | None |
| Finance Module | 20% | 100% | 3d | 🔴 Critical | P0 | Core |
| Conversion Engine | 5% | 100% | 2d | 🔴 Critical | P0 | Finance, Delivery |
| Notifications | 10% | 85% | 2d | 🔴 Critical | P0 | Core, notifications table |
| Client Portal | 45% | 90% | 2d | 🔴 Critical | P0 | Projects, Deliverables |
| Dashboard | 5% | 90% | 1.5d | 🟠 High | P1 | All modules |
| Navigation Shell | 25% | 100% | 2.5d | 🟠 High | P1 | All layouts |
| Sales Workspace | 70% | 95% | 1.5d | 🟠 High | P1 | websiteLeads fix |
| Delivery Workspace | 55% | 90% | 2d | 🟠 High | P1 | Task Drawer, Reviews |
| Finance Workspace (UI) | 40% | 90% | 2d | 🟠 High | P1 | Finance Module |
| Directory Workspace | 20% | 90% | 2d | 🟡 Medium | P1 | Organizations |
| Settings | 30% | 90% | 1d | 🟡 Medium | P2 | Team, RBAC |
| Inbox / Notifications | 0% | 85% | 1d | 🟠 High | P1 | Notifications module |
| Automation | 20% | 40% | 0d | 🟢 Low | P3 | Trigger.dev (V2) |
| Testing | 25% | 80% | 4d | 🔴 Critical | P0 | All modules done |
| **TOTAL** | **~42%** | **~90%** | **~28d** | — | — | — |

---

## SECTION 14 — Implementation Order

```
 1. [Sprint 0]  P0 Fixes             — Portal data fix, Finance module skeleton, billing.ts refactor
 2. [Sprint 1]  Conversion Engine    — ProposalAccepted + InvoicePaid handlers + Webhook
 3. [Sprint 1]  Notification System  — notifications table + real user ID resolution
 4. [Sprint 2]  Navigation Shell     — Workspace layouts, topbar, breadcrumbs, workspace switcher
 5. [Sprint 3]  Executive Dashboard  — KPI cards, revenue chart, activity feed
 6. [Sprint 3]  Inbox                — Notification center + bell component
 7. [Sprint 4]  Sales Cleanup        — Fix leads page, consolidate proposals to /sales/
 8. [Sprint 5]  Delivery Gaps        — /delivery/reviews, Task Drawer, project tabs
 9. [Sprint 6]  Finance UI Pages     — /finance workspace 4 pages
10. [Sprint 6]  Directory Workspace  — /directory workspace 3 pages
11. [Sprint 7]  Portal Completion    — /portal/reviews, /portal/documents, /portal/settings, onboarding
12. [Sprint 8]  Settings             — /settings/profile, /settings/system, move services catalog
13. [Sprint 8]  UX Polish            — loading.tsx everywhere, empty states, breadcrumbs, bulk actions
14. [Sprint 9]  Testing              — Integration tests, E2E Playwright suite
15. [Sprint 9]  Hardening            — Security audit, N+1 fixes, caching, performance
16. [Sprint 9]  Production Prep      — Env vars, webhooks verified, Sentry, migrations tested
```

### Why This Order Minimizes Rework

- **Steps 1–3 (P0 fixes first):** Every subsequent feature depends on correct data. Building the dashboard before fixing the portal would mean building a broken dashboard. The Conversion Engine must exist before testing the full sales flow.
- **Step 4 (Navigation before pages):** Building new workspace pages inside the wrong layout skeleton creates immediate rework. Navigation must be the container before pages go inside.
- **Step 5–6 (Dashboard before workspace pages):** The dashboard aggregates from all modules. It serves as the integration test for the data layer — if KPIs show wrong numbers, it identifies data bugs before they're buried in pages.
- **Steps 7–10 (Workspace pages after containers):** Now that the navigation shell and layouts are correct, workspace pages can be built with confidence they'll appear in the right place.
- **Step 11–12 (Portal and Settings last among UI):** Portal depends on real project data (fixed in Step 1). Settings has no dependencies on other workspaces.
- **Steps 13–16 (Polish, then test, then harden):** UX polish before testing means E2E tests validate the polished UX. Hardening is always last — it validates the complete system.

---

## SECTION 15 — Success Criteria

### Feature Complete (Internal Alpha)
> All core user journeys executable without manual workarounds.

- [ ] Lead captured from website form → visible in `/sales/leads`
- [ ] Lead qualified → Deal appears on `/sales/pipeline` Kanban
- [ ] Deal advanced to Proposal stage → Proposal created and sent to client
- [ ] Client signs proposal → Project automatically created in DB
- [ ] Deposit invoice automatically generated on proposal signature
- [ ] Invoice marked paid → Project transitions to "active" status
- [ ] PM uploads deliverable → Submits for client review
- [ ] Client approves deliverable in Client Portal
- [ ] All domain events emit notifications to real users
- [ ] Executive Dashboard shows real-time KPIs from all modules
- [ ] Navigation has separate workspace sidebars with no `/crm/` duplicates
- [ ] All 5 broken P0 issues resolved

---

### Beta Ready (Trusted Client Access)
> The system can be used by 5 real clients without data errors or workflow failures.

All Feature Complete criteria PLUS:
- [ ] Client Portal shows correct project data (not deals)
- [ ] `/portal/reviews` and `/portal/documents` functional
- [ ] Client receives email notification when deliverable submitted for review
- [ ] Payment recording correctly activates projects
- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty states with CTAs on all list pages
- [ ] Breadcrumbs on all pages
- [ ] No hardcoded user IDs or static strings in business logic
- [ ] E2E Playwright suite passes 100%
- [ ] Sentry active and capturing errors

---

### Production Ready
> Safe to switch the full agency onto the platform.

All Beta Ready criteria PLUS:
- [ ] Razorpay/Stripe webhook verified in production
- [ ] Clerk webhook verified in production
- [ ] All DB migrations tested up and down in staging
- [ ] Redis caching active for dashboard aggregations
- [ ] No N+1 queries on high-traffic pages (verified by query analyzer)
- [ ] Lighthouse score > 90 on Client Portal home
- [ ] All Server Actions use `internalActionClient` or `tenantActionClient`
- [ ] No raw `db.*` calls outside repository files
- [ ] Security IDOR test: verified cannot access another tenant's data with wrong auth token
- [ ] Runbook documented for DevOps, DB rollback, and incident response
- [ ] 80%+ code coverage on Finance and Conversion Engine modules

---

### Enterprise Ready
> Safe for commercial client delivery at scale.

All Production Ready criteria PLUS:
- [ ] Bulk actions on all DataTables (select + floating action bar)
- [ ] CSV export on all list views
- [ ] PDF export for invoices and proposals
- [ ] Audit log UI visible to System Admins
- [ ] Role-specific dashboard widgets (Sales/PM/Finance/Admin views)
- [ ] Command Palette (Cmd+K) functional with entity search
- [ ] Optimistic locking on all financial entities
- [ ] 10-second Undo for task moves and kanban card drags
- [ ] GDPR: Soft-delete + hard-delete on request (30 day auto-purge)
- [ ] Contact import wizard with duplicate detection
- [ ] Retainer management with auto-period generation

---

*This roadmap is the single source of truth for all rebuild work. Every sprint, every task, and every exit criterion traces directly to the PRD, TDD, EAIG, and BCDG. No work not described here should be begun without amending this document.*
