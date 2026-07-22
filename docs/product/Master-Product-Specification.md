# Aarotech Master Product Specification (MPS)

This document serves as the single source of truth for the Aarotech platform's product architecture, navigation, workflows, and business rules. It is the definitive guide for the Product Rebuild Phase.

## 1. Single Source of Truth & Entity Ownership
Every entity in the platform has exactly one authoritative owner workspace. Duplicate views must be eliminated.

| Entity | Primary Workspace Owner | Data Source |
| :--- | :--- | :--- |
| **Leads** | Sales (`/sales/leads`) | `websiteLeads` table (unqualified) |
| **Organizations** | Directory (`/directory/organizations`) | `organizations` table |
| **Contacts** | Directory (`/directory/contacts`) | `contacts` table |
| **Deals** | Sales (`/sales/pipeline`) | `deals` table |
| **Proposals** | Sales (`/sales/proposals`) | `proposals` table |
| **Projects** | Delivery (`/delivery/projects`) | `projects` table |
| **Tasks** | Delivery (`/delivery/tasks`) | `tasks` table |
| **Deliverables** | Delivery (`/delivery/reviews`) | `deliverables` table |
| **Invoices** | Finance (`/finance/invoices`) | `invoices` table |
| **Payments** | Finance (`/finance/payments`) | `payments` table |
| **Client Visibility** | Client Portal (`/portal`) | Filtered Read-Models (Projects, Deliverables, Invoices) |

## 2. Final Route Architecture & Workspace Ownership
The monolithic `/crm` route group is DEPRECATED and will be dismantled. The system is divided into strict bounded contexts.

*   **Executive Dashboard (`/`)**: Aggregated read-models of business health (KPIs, revenue charts, recent activity). 
*   **Sales Workspace (`/sales`)**: Lead qualification, pipeline management, and proposals.
*   **Delivery Workspace (`/delivery`)**: Project execution, task management, and deliverable review.
*   **Finance Workspace (`/finance`)**: Invoicing, payment ledger, and MRR tracking.
*   **Directory Workspace (`/directory`)**: Master CRM data for organizations and contacts.
*   **Inbox / Notifications (`/inbox`)**: Dedicated notification center for users to track alerts and actions.
*   **System Settings (`/settings`)**: Agency configuration, roles, team management, and services.
*   **Automations (`/automations`)**: Trigger.dev background job monitoring and logging.
*   **Client Portal (`/portal`)**: External facing read-only project tracking and payment UI. Clients only see `projects` (never `deals`).

*Global Shell Components:* All admin routes are wrapped in an `AdminShell` providing a unified Topbar (Global Search, Notifications Bell, Workspace Switcher, User Menu) and Breadcrumbs.

## 3. End-to-End Business Workflows

### 3.1 The Complete Enterprise Lifecycle
`Website Lead -> Qualified Lead (Creates Org/Contact/Deal) -> Proposal Sent -> Proposal Approved (Conversion Engine fires: Creates Project & Deposit Invoice) -> Invoice Paid (Project Activated) -> Delivery (Tasks/Deliverables) -> Client Review (Approve/Reject) -> Completion`

### 3.2 The Conversion Engine (Sales → Delivery)
1.  **Proposal Acceptance:** A Client accepts a proposal via magic link or portal.
2.  **Automation Triggered (`ProposalAccepted` Event):**
    *   System automatically creates an active `Project`.
    *   System automatically generates a `Deposit Invoice` via Finance Service.
    *   System resolves PM/Sales roles and notifies real user IDs.

### 3.3 Financial Verification & Activation (Delivery Unleashed)
1.  **Payment Intent:** Client clicks "I have sent payment" (UTR/Manual flow) in the portal.
2.  **Pending State:** Invoice marked `pending_verification`, `Payment` record created as `pending_verification`.
3.  **Verification:** Finance Officer clicks "Verify" in `/finance/payments`.
4.  **Activation:** `InvoicePaid` event fires → transitions Project status from `pending_deposit` to `active`.

### 3.4 Deliverable Review Lifecycle
1.  **Submit:** PM uploads a `Deliverable` and marks it `in_review`.
2.  **Notify:** Client receives email and in-app notification.
3.  **Review:** Client views in `/portal/reviews` and clicks "Approve" or "Request Changes".
4.  **Resolve:** `DeliverableReviewed` event fires, notifying the PM and unlocking the associated `Task`.

### 3.5 Client Onboarding Lifecycle
1.  **Invite:** Post-deal conversion, system generates magic link to portal.
2.  **Onboarding:** Client logs in, is intercepted by onboarding checklist middleware (`/portal/onboarding`).
3.  **Completion:** Client completes forms, unlocks main portal dashboard.

## 4. Architecture Compliance
*   **Domain-Driven Design (DDD):** Workspaces represent distinct bounded contexts.
*   **Repository Pattern:** `Controller/Server Action -> Service Layer -> Repository Layer -> Database`. NEVER bypass the repository (e.g., no raw `db.insert` in actions).
*   **Tenant Isolation & RBAC:** All queries must validate `organizationId` and user roles at the service layer.
*   **Event-Driven:** Workflows are orchestrated via `events.ts` utilizing asynchronous patterns and (where applicable) outbox models.
*   **Notification Resolution:** `notificationService` must dynamically resolve `userIds` from `organizationMembers` tables based on roles (e.g., `admin`, `pm`).

## 5. UI/UX Standards
*   **DataTables:** Platform-wide generic `DataTable` component with filtering, sorting, pagination, and bulk actions.
*   **Empty States:** Standardized `EmptyState` component with illustrations and CTAs.
*   **Loading States:** Layout-aware skeleton loaders (`loading.tsx`) across all route segments.
*   **Breadcrumbs:** Persistent contextual breadcrumbs in every workspace.
