# Aarotech Enterprise Platform — Product Requirements Document (PRD)

**Role:** Product Owner & Solution Architect  
**Status:** Approved for Development  

This document serves as the absolute source of truth for the product structure, UI specifications, and development backlog. It builds directly upon the approved Enterprise Technical Design Document (TDD) and the finalized Product IA Audit.

---

## SECTION 1: Product Sitemap

**Workspace: Global Navigation (Admin)**
- / (Overview - Command Center)
- /inbox (Notifications & Approvals)

**Workspace: Sales**
- /sales/leads (Unqualified)
- /sales/pipeline (Qualified Opportunities)
- /sales/proposals (Draft & Sent Contracts)

**Workspace: Delivery**
- /delivery (Operations Command Center)
- /delivery/projects
  - /delivery/projects/[id]
- /delivery/tasks
- /delivery/reviews (Global queue of deliverables)

**Workspace: Finance**
- /finance (Revenue Command Center)
- /finance/invoices
  - /finance/invoices/[id]
- /finance/payments

**Workspace: Directory**
- /directory/organizations
  - /directory/organizations/[id]
- /directory/contacts

**Workspace: System**
- /settings/profile
- /settings/team
- /settings/services
- /settings/system

**Workspace: Client Hub (Portal)**
- /portal/home (Action-oriented Dashboard)
- /portal/reviews (Deliverables needing approval)
- /portal/billing (Invoices + Stripe Checkout)
- /portal/documents (Contracts & Assets)
- /portal/settings

---

## SECTION 2: Workspace Specification

### 1. Sales Workspace
- **Purpose:** Manage the pre-sales pipeline from lead capture to contract signature.
- **Target Users:** Account Executives, Sales Managers.
- **Responsibilities:** Qualify leads, move deals through pipeline stages, generate proposals.
- **Entry Points:** Main sidebar, Global Search, Lead creation webhook.
- **Exit Points:** Proposal signature (transitions deal to Delivery workspace).
- **Permissions:** Read/Write for Sales & Admins. No access for Delivery or Clients.

### 2. Delivery Workspace
- **Purpose:** Execute active client engagements.
- **Target Users:** Project Managers, Designers, Developers.
- **Responsibilities:** Track project health, manage tasks, draft deliverables, request client reviews.
- **Entry Points:** Sidebar, Deal Won event.
- **Exit Points:** Project Completion.
- **Permissions:** Read/Write for Delivery & Admins. Read-only for Sales (contextual).

### 3. Finance Workspace
- **Purpose:** Manage accounts receivable and ledgers.
- **Target Users:** Finance Officers, Admins.
- **Responsibilities:** Generate invoices, track Stripe payments, manage retainers.
- **Permissions:** Strict access for Finance & Admins only.

### 4. Client Hub
- **Purpose:** A frictionless interface for clients to approve work and pay bills.
- **Target Users:** External Client Admins & Members.
- **Entry Points:** Magic link in email, direct login.
- **Permissions:** Strictly scoped to `organization_id`. Cannot see other clients' data.

---

## SECTION 3: Page Specification

*(Example detailing the critical Project Detail Page. This format applies to all pages.)*

**Page:** `/delivery/projects/[id]`
- **Purpose:** Single source of truth for executing a client engagement.
- **Who can access:** Admins, Delivery Team.
- **Page Layout:** 
  - **Header:** Project Name, Organization Name, Status Badge, Progress Bar.
  - **Tabs:** Overview, Tasks, Deliverables, Activity.
- **Widgets:** Budget Burn Rate, Overdue Tasks Counter.
- **Cards:** Deliverable preview cards (Gallery view).
- **Tables:** Tasks list (Columns: Name, Assignee, Status, Due Date).
- **Filters:** Filter tasks by Status, Assignee.
- **Search:** Local search within project tasks/deliverables.
- **Quick Actions:** "+ Add Task", "+ Upload Deliverable".
- **Bulk Actions:** Select multiple tasks -> Assign / Delete.
- **Dialogs:** "Create Deliverable" modal (File upload + naming).
- **Drawers:** Task Detail Drawer (slides from right when clicking a task).
- **Empty State:** "No tasks yet. Create a task or apply a template." (Illustration included).
- **Loading State:** Skeleton loaders matching the table/card grid.
- **Error State:** "Failed to load project details. [Retry]"
- **Success State:** Toast notification: "Deliverable sent for review."
- **Keyboard Shortcuts:** `c` (Create task), `Cmd+K` (Global Search).

---

## SECTION 4: Components

**Global Reusable Components:**
1. **Forms:** Auto-saving inputs, rich text editor (TipTap) for proposals, multi-select dropdowns for assignees.
2. **Tables:** Sortable headers, sticky headers, pagination footer, bulk selection checkboxes, inline row editing.
3. **Cards:** Kanban cards (draggable), Deliverable preview cards (image thumbnail + status badge).
4. **Status Badges:** Pill-shaped. (Green = Approved/Won, Yellow = In Review/Pending, Red = Blocked/Overdue, Gray = Draft).
5. **Timeline:** Vertical activity feed with user avatars, timestamps, and action descriptions.
6. **Comments:** Threaded discussions, @mentions, rich text.
7. **Uploader:** Drag-and-drop zone (UploadThing integration), progress bar, multi-file support.
8. **Approval Component:** Large split button (Green "Approve", Red "Request Changes") specific to Client Hub.
9. **Command Palette:** Global Cmd+K modal for search and quick actions.

---

## SECTION 5: User Actions

**Page: Deliverables Queue (`/delivery/reviews`)**
- **Create:** Upload a new deliverable file.
- **Edit:** Change deliverable name or internal status.
- **Delete:** Remove draft deliverable.
- **Submit:** Move from 'Draft' to 'Awaiting Client Review'.
- **Comment:** Add internal or client-facing notes.
- **Upload Version:** Add v2 of a file based on feedback.
- **Approve:** (Client only) Mark as accepted.
- **Reject:** (Client only) Mark as changes requested.
- **Share:** Generate public preview link.

---

## SECTION 6: Acceptance Criteria

**Feature: Client Proposal Approval (Conversion Engine)**
- **Given:** A client views a Proposal in the Client Hub with status 'Sent'.
- **When:** The client signs the proposal and clicks "Accept".
- **Then:** 
  1. The Proposal status changes to 'Accepted'.
  2. The linked Deal status changes to 'Won'.
  3. A new Project is automatically instantiated from the proposal details.
  4. An email notification is sent to the Sales Rep and Delivery Team.
- **Success Criteria:** DB transaction completes; UI reflects 'Accepted' state instantly.
- **Failure Cases:** Signature field is empty (Disable submit button). Network error during submission (Show error toast, do not transition deal).
- **Validation Rules:** Only authenticated members of the associated `organization_id` can sign.

---

## SECTION 7: Development Backlog

### Epic 1: Foundation & Security
- **Feature 1.1:** Core Layout & Routing (Sidebar, Topbar).
- **Feature 1.2:** Database schema updates (Tenant Isolation constraints).
- **Feature 1.3:** Middleware auth & RBAC enforcement.

### Epic 2: Sales Workspace
- **Feature 2.1:** Leads Table & CRUD.
- **Feature 2.2:** Kanban Pipeline (Deals).
- **Feature 2.3:** Proposal Generator (TipTap integration).

### Epic 3: Delivery Workspace
- **Feature 3.1:** Projects List & Detail View.
- **Feature 3.2:** Task Management (Tables & Drawers).
- **Feature 3.3:** Deliverable Uploads & Versioning.

### Epic 4: Finance Workspace
- **Feature 4.1:** Invoice Generation.
- **Feature 4.2:** Stripe Webhook Integration.

### Epic 5: Client Hub
- **Feature 5.1:** Client Authentication (Magic Links).
- **Feature 5.2:** Deliverable Approval Interface.
- **Feature 5.3:** Embedded Stripe Checkout.

---

## SECTION 8: Implementation Order

To minimize rework and ensure architectural stability, engineering must execute in this exact sequence:

1. **Foundation** (App Router structure, UI Component Library, Auth Middleware)
2. **Database Security** (Schema constraints, `organization_id` checks)
3. **Directory** (Organizations, Contacts - foundational for all other entities)
4. **Sales Workspace** (Leads -> Deals -> Proposals)
5. **Finance Workspace** (Invoices, Stripe Webhooks)
6. **Conversion Engine** (The glue: Proposal signed -> Project created)
7. **Delivery Workspace** (Projects, Tasks, Deliverables)
8. **Client Hub** (External facing views restricted by auth)
9. **Notifications & Activity Logs** (Global timelines, Emails)
10. **Command Palette & Search** (Global UX Polish)

---

## SECTION 9: Definition of Done (DoD)

A feature, page, or story is only considered "Done" when it meets all of the following:

1. **Code:** Implemented exactly according to the PRD without deviating from the IA.
2. **Security:** `requireOrganizationMember()` and/or strict RBAC is enforced on the route/action.
3. **Resilience:** All mutations use `withActionErrorHandling()`.
4. **UX Consistency:** Empty states, loading skeletons, and error toasts are fully implemented.
5. **Tests:** Server Actions have corresponding integration tests; critical UI paths have Playwright E2E tests.
6. **Review:** Passes internal design/UX review ensuring adherence to the Component library (no custom CSS/hacks).
