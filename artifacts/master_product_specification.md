# Aarotech Enterprise Platform — Master Product Specification (MPS)

**Role:** Chief Product Officer, Enterprise Solution Architect, Principal UX Designer, Lead Technical Architect
**Status:** Final Executable Product Specification
**Date:** 2026-07-21

> **Notice:** This document is the SINGLE SOURCE OF TRUTH for the Aarotech Enterprise Platform product execution. It supersedes all prior PRDs, TDDs, and roadmaps. No implementation decisions should be made outside the bounds of this document.

---

## SECTION 1 — Product Vision

Aarotech is a unified, role-aware, multi-workspace enterprise platform for digital agencies. It eliminates disconnected tools (CRMs, PM tools, billing software, client portals) by providing one cohesive system that handles the complete client lifecycle: from the moment a website visitor submits a lead, through deal negotiations, contract signing, project delivery, client approvals, and final payment. It provides an automated, secure, and premium experience for both internal agency staff and external clients.

---

## SECTION 2 — Product Goals

1. **Zero Data Leaks:** Strict tenant isolation preventing any cross-organization data exposure.
2. **Frictionless Workflow:** Fully automated handoffs between Sales, Delivery, and Finance via the Conversion Engine.
3. **Workspace Focus:** Role-based navigation ensuring users only see the tools relevant to their job (no CRM clutter for Finance).
4. **Premium Enterprise UX:** Sub-second response times, optimistic UI, consistent design system, and professional client portal.
5. **Auditable Operations:** Every mutation leaves an immutable audit trail; entities support enterprise lifecycles (archiving, soft deletes).

---

## SECTION 3 — User Roles

### Internal Roles (Agency Staff)

| Role | Permissions & Responsibilities | Navigation Access |
| :--- | :--- | :--- |
| **Owner** | Full system access. Manages agency settings, team roles, services, and billing. | All Workspaces + System Settings |
| **Admin** | Full operational access. Can override locks, reassign deals/projects, manage automation logs. | All Workspaces + System Settings |
| **Sales** | Manages Leads, Deals, and Proposals. Can view Directory and limited Finance data (invoice status). | Sales, Directory |
| **Project Manager** | Manages Projects, Tasks, and Deliverables. Submits work for client review. | Delivery, Directory |
| **Designer / Developer** | Staff executing tasks and uploading deliverables. Limited cross-project visibility. | Delivery |
| **Finance** | Manages Invoices, Payments, and Retainers. Can void invoices and record offline payments. | Finance, Directory |

### External Roles (Clients)

| Role | Permissions & Responsibilities | Navigation Access |
| :--- | :--- | :--- |
| **Client Admin** | Primary point of contact. Can sign proposals, approve deliverables, pay invoices, and manage their team. | Full Client Hub |
| **Client Guest** | Limited access. Can view documents and approve deliverables, but cannot view invoices or sign contracts. | Reviews, Documents |

---

## SECTION 4 — Information Architecture

### Target Route Structure

```text
/ (Admin Root)
├── /                           → Executive Dashboard
├── /inbox                      → Notification Center

├── /sales/                     → Sales Workspace
│   ├── /sales/leads            → Website Leads
│   ├── /sales/pipeline         → Deal Kanban Board
│   └── /sales/proposals        → Proposals List
│       └── /sales/proposals/[id] → Proposal Editor

├── /delivery/                  → Delivery Workspace
│   ├── /delivery               → Delivery Command Center
│   ├── /delivery/projects      → All Active Projects
│   │   └── /delivery/projects/[id] → Project Detail (Overview, Tasks, Deliverables, Activity)
│   ├── /delivery/tasks         → Cross-project Task Board
│   └── /delivery/reviews       → Global Deliverables Review Queue

├── /finance/                   → Finance Workspace
│   ├── /finance                → Revenue Command Center
│   ├── /finance/invoices       → Invoice List
│   │   └── /finance/invoices/[id] → Invoice Detail
│   ├── /finance/payments       → Payment Ledger
│   └── /finance/retainers      → Retainer Management

├── /directory/                 → Directory Workspace
│   ├── /directory/organizations → Organizations List
│   │   └── /directory/organizations/[id] → Org Profile
│   └── /directory/contacts     → Contacts Directory

├── /automations/               → Background Job Monitor
├── /reports/                   → Cross-module reporting

└── /settings/                  → System Workspace
    ├── /settings/profile       → User Profile
    ├── /settings/team          → Team Management
    ├── /settings/services      → Service Catalog
    └── /settings/system        → Agency Preferences

/portal/ (Client Hub Root)
├── /portal/home                → Client Dashboard
├── /portal/reviews             → Approval Queue
├── /portal/billing             → Invoice list + Pay
├── /portal/documents           → Signed contracts + assets
└── /portal/settings            → Account settings
```

---

## SECTION 5 — Navigation Specification

- **Topbar:** Persistent across all internal pages. Contains: Logo (links to `/`), Workspace Switcher Dropdown, Global Search Input (Cmd+K), Notification Bell (with unread count badge), User Avatar Menu (Profile, Settings, Logout).
- **Sidebar:** Contextual to the active workspace. Changes entirely when switching workspaces (e.g., Sales sidebar has different links than Finance sidebar). Collapsible.
- **Breadcrumbs:** Below the topbar on every page (e.g., `Sales / Proposals / Q3 Contract`).
- **Quick Actions:** Floating Action Button (FAB) or Topbar `+` menu allowing instant creation of Lead, Deal, Task, or Invoice based on user permissions.
- **Command Palette (Cmd+K):** Global search across Organizations, Deals, Projects, and Contacts. Also includes navigation shortcuts (e.g., "Go to Settings").

---

## SECTION 6 — Module Specifications

### Dashboard
- **Purpose:** Executive command center.
- **Pages:** `/`
- **Users:** Owner, Admin
- **Components:** KPI Cards, RevenueChart, ActivityFeed.
- **Dependencies:** All data models (read-only aggregations).

### Sales
- **Purpose:** Pre-sales lifecycle management.
- **Pages:** `/sales/leads`, `/sales/pipeline`, `/sales/proposals`
- **Users:** Sales, Admin
- **Business Rules:** Leads convert to Deals. Deals generate Proposals.
- **Events:** `DealWon`, `ProposalAccepted`

### Delivery
- **Purpose:** Post-sales execution and client collaboration.
- **Pages:** `/delivery`, `/delivery/projects`, `/delivery/tasks`, `/delivery/reviews`
- **Users:** PM, Designer, Developer
- **Business Rules:** Projects activate on `InvoicePaid`. Deliverables require client approval to lock.
- **Events:** `DeliverableSubmitted`, `DeliverableApproved`, `RevisionRequested`

### Finance
- **Purpose:** Revenue collection and compliance.
- **Pages:** `/finance`, `/finance/invoices`, `/finance/payments`, `/finance/retainers`
- **Users:** Finance, Admin
- **Business Rules:** Invoices are immutable once open (void only). Payments update invoice status automatically.
- **Events:** `InvoiceCreated`, `InvoicePaid`

### Directory
- **Purpose:** Master registry of root tenants (Organizations) and people (Contacts).
- **Pages:** `/directory/organizations`, `/directory/contacts`
- **Users:** All internal users (read), Sales/Admin (write).
- **Business Rules:** Organizations own all Deals, Projects, and Invoices.

### Client Portal
- **Purpose:** Frictionless external interface for clients.
- **Pages:** `/portal/home`, `/portal/reviews`, `/portal/billing`, `/portal/documents`
- **Users:** Client Admin, Client Guest
- **Business Rules:** Strict tenant isolation. Clients see Projects, not Deals. Cannot edit, only approve/pay/comment.

---

## SECTION 7 — Page Specifications

*(Representative sample - pattern applies to all pages)*

### Sales Pipeline (`/sales/pipeline`)
- **Header:** Title ("Pipeline"), Pipeline Value KPI, Deal Count KPI.
- **Toolbar:** Filter by Owner, Search by Name. Quick action: `+ New Deal`.
- **Primary Component:** `KanbanBoard` with columns mapped to Deal Stages.
- **Card:** Deal Name, Org Name, Value, Owner Avatar.
- **Actions:** Drag-and-drop to update stage. Click opens Deal Drawer.
- **Loading:** Column skeletons.
- **Empty:** "No deals in pipeline. Promote a lead to get started." + CTA.

### Project Detail (`/delivery/projects/[id]`)
- **Header:** Project Name, Org Link, Status Badge, Health Badge.
- **Tabs:**
  - **Overview:** Progress bar, budget burn chart, description.
  - **Tasks:** DataTable of tasks. Click opens TaskDrawer.
  - **Deliverables:** Grid of FileCards. Upload button.
  - **Activity:** ActivityTimeline component.
- **Permissions:** PMs can edit. Sales can view.

### Deliverables Review Queue (`/portal/reviews`)
- **Header:** Title ("Pending Approvals").
- **List:** Cards for each deliverable with `status = 'in_review'`.
- **Card Action:** "Review Now" opens full screen modal with file preview and ApprovalPanel (Approve/Request Changes).

---

## SECTION 8 — Business Workflows

### The Core Conversion Engine
1. **Lead** submits form → `websiteLeads` table.
2. Sales clicks **Qualify** → creates Organization, Contact, and Deal (Stage: Discovery).
3. Deal moves to **Proposal** stage. Sales drafts and sends Proposal.
4. Client signs Proposal → **`ProposalAccepted` Event Fired**.
5. Event handler (Transaction):
   - Deal updated to 'Won'.
   - Project created (Status: 'pending_deposit').
   - Deposit Invoice created (Status: 'open').
6. Client **Pays Invoice** via Stripe/Razorpay → **`InvoicePaid` Event Fired**.
7. Event handler:
   - Project updated to 'active'.
   - Delivery team notified. Work begins.

### Deliverable Approval Cycle
1. PM **Uploads** file to Project.
2. PM clicks **Submit for Review** → `DeliverableSubmitted` event. Client notified.
3. Client views in Portal.
   - If **Changes Requested**: `RevisionRequested` event. Status → 'changes_requested'. PM notified. PM uploads v2. Goto Step 2.
   - If **Approved**: `DeliverableApproved` event. Status → 'approved'. Version locked. PM notified.

---

## SECTION 9 — Data Ownership (DDD)

- **Directory Module:** Owns `organizations`, `contacts`. (Source of truth for identity).
- **Sales Module:** Owns `websiteLeads`, `deals`, `proposals`. (Source of truth for pre-revenue).
- **Finance Module:** Owns `invoices`, `payments`, `retainers`. (Source of truth for revenue).
- **Delivery Module:** Owns `projects`, `tasks`, `deliverables`, `comments`. (Source of truth for execution).
- **Core Module:** Owns `users`, `auditLogs`, `activityLogs`, `notifications`.

---

## SECTION 10 — Domain Events

| Event Name | Publisher | Subscribers (Side Effects) |
| :--- | :--- | :--- |
| `DealWon` | Sales | Delivery (Prepare template) |
| `ProposalAccepted` | Sales | Finance (Create Invoice), Delivery (Create Project), Core (Notify) |
| `InvoiceCreated` | Finance | Core (Notify Client) |
| `InvoicePaid` | Finance | Delivery (Activate Project), Core (Notify PM) |
| `DeliverableSubmitted` | Delivery | Core (Notify Client) |
| `DeliverableApproved` | Delivery | Core (Notify PM), Delivery (Update Task) |
| `RevisionRequested` | Delivery | Core (Notify PM) |

---

## SECTION 11 — Component Library

- **DataTable:** Universal sortable/filterable table with bulk action support.
- **KanbanBoard:** Drag-and-drop pipeline interface with optimistic UI.
- **TaskDrawer:** Slide-in panel for task details, managed via URL `?taskId=`.
- **FileCard:** Thumbnail preview for deliverables with version badge.
- **ApprovalPanel:** Split button for Approve (Green) / Request Changes (Red) with comment box.
- **ActivityTimeline:** Visualizes audit logs with icons and timestamps.
- **StatCard:** KPI display with trend indicator.
- **WorkspaceSwitcher:** Topbar dropdown for navigating macro-contexts.

---

## SECTION 12 — UX Standards

- **Loading:** Every data page MUST have a `loading.tsx` skeleton. Buttons MUST show spinners during mutations.
- **Empty States:** MUST include an illustration, a descriptive text, and a primary CTA button.
- **Mutations:** Optimistic updates where possible. MUST return a Toast (Green success, Red actionable error).
- **Destructive Actions:** MUST require a confirmation Dialog. High-risk actions (delete org) require typing the name.
- **Accessibility:** Radix UI / Shadcn primitives guarantee keyboard navigation and ARIA attributes.
- **Responsive:** Sidebar collapses to hamburger menu on mobile. DataTables become stacked cards on mobile.

---

## SECTION 13 — Security Rules

- **Tenant Isolation:** Every query involving client data MUST include `.where(eq(table.organizationId, orgId))`.
- **Action Wrappers:** All mutations MUST use `createSafeAction`. Raw `"use server"` is forbidden.
   - `tenantActionClient`: For operations within a specific client context.
   - `internalActionClient`: For agency staff operations across clients.
- **Audit Logging:** Every mutation MUST insert a record into `auditLogs` detailing actor, action, and diff.
- **Soft Deletes:** Records are marked `deletedAt`, never hard deleted (except by system cron after 30 days).

---

## SECTION 14 — Acceptance Criteria

- **Feature Complete:** All workflows in Section 8 can be executed end-to-end via the UI without database manual intervention.
- **Beta Ready:** Client portal shows accurate project data. All P0 and P1 bugs from UX audit resolved. E2E tests pass for the core conversion engine.
- **Production Ready:** No N+1 query performance issues. Webhooks (Stripe, Clerk) verified in live environment. Security audit confirms strict tenant isolation.
- **Enterprise Ready:** Bulk table operations, CSV exports, automated retainer billing, and advanced RBAC roles fully implemented.

---

## SECTION 15 — Definition of Done (Per Feature)

- [ ] Implemented in designated Workspace following DDD boundaries.
- [ ] Server Action uses appropriate safe-action client.
- [ ] Database query enforces Tenant Isolation (`organizationId`).
- [ ] Mutation generates Audit Log entry.
- [ ] UI handles Loading, Empty, Success, and Error states.
- [ ] Component uses design system primitives (Shadcn/Tailwind).
- [ ] Unit/Integration tests written for service logic.
- [ ] E2E test updated if workflow changed.
- [ ] Code reviewed and approved.

---
*(End of Master Product Specification)*
