# Aarotech Agency OS — Release Candidate (RC) Acceptance Report

**Document Classification:** OFFICIAL PRODUCTION READINESS DOCUMENT  
**Prepared By:** Principal QA Architect & Release Manager  
**Audit Date:** 2026-07-23  
**Codebase Commit:** `8aefdd6` (QA Round 1)  
**Framework:** Next.js 15.5.21 · Drizzle ORM · Clerk Auth · Resend · Inngest · UploadThing · Neon PostgreSQL

---

## 1. Executive Summary

The Aarotech Agency OS is an ambitious, vertically-integrated SaaS platform covering the full agency lifecycle — from website lead capture through proposal, client delivery, invoicing, and payment. The architecture is well-structured using a domain-module pattern with bounded contexts (Sales, Delivery, Finance, Portal, Core), and the overall code quality is above average.

However, this audit has uncovered **61 distinct issues** across Bugs, Missing Features, Security Risks, Data Integrity Problems, UX Deficiencies, and Technical Debt. The most critical finding is a **CRITICAL duplicate export collision in `src/modules/finance/actions.ts`** that will cause a **TypeScript compile-time crash** and **runtime failure in the finance module**. Additionally, several dashboard metrics are still returning **hardcoded mock data** rather than real database queries, and the Client Portal has multiple **NOT IMPLEMENTED** sections that have not been connected to real data.

**This system is NOT ready for production release in its current state.** A focused stabilization sprint of 5–7 days targeting the critical and high-priority items identified below is required before a GO decision can be made.

---

## 2. Production Readiness Score

| Domain | Score | Status |
|---|---|---|
| Authentication & Auth Guard | 82/100 | CONDITIONAL |
| Organizations Module | 55/100 | HIGH RISK |
| Contacts Module | 38/100 | HIGH RISK |
| Leads Module | 65/100 | CONDITIONAL |
| Deals / Pipeline | 72/100 | CONDITIONAL |
| Proposals | 68/100 | CONDITIONAL |
| Client Portal | 52/100 | HIGH RISK |
| Projects / Delivery | 70/100 | CONDITIONAL |
| Tasks & Milestones | 65/100 | CONDITIONAL |
| Deliverables | 62/100 | CONDITIONAL |
| Manual Finance | 58/100 | HIGH RISK |
| UploadThing / Files | 45/100 | HIGH RISK |
| Dashboard | 50/100 | HIGH RISK |
| Notifications / Inbox | 70/100 | CONDITIONAL |
| Automations / Inngest | 55/100 | CONDITIONAL |
| Settings | 45/100 | HIGH RISK |
| Database Integrity | 72/100 | CONDITIONAL |
| Security | 68/100 | CONDITIONAL |
| Performance | 65/100 | CONDITIONAL |
| Code Quality | 55/100 | HIGH RISK |

**Overall Production Readiness Score: 60/100 — CONDITIONAL GO (Major Blockers Remain)**

---

## 3. Module-by-Module Audit Results

### 3.1 Authentication

| Check | Result |
|---|---|
| Exists | YES — Clerk integration in place |
| Reachable | YES — `/sign-in`, `/sign-up` via Clerk hosted pages |
| Functional | YES — `requireAuthenticatedUser()` in `src/lib/auth.ts` |
| Organization Scoped | PARTIAL — Clerk org context via `tenantActionClient` requires active Clerk org |
| Secure | PARTIAL — See Security section |
| Role Assignment | PARTIAL — Roles derived from email domain heuristic, not from Clerk metadata properly |
| Webhook Sync | YES — `/api/webhooks/clerk/route.ts` handles `user.created`, `user.updated`, `user.deleted` |
| Session | YES — Clerk session management |
| Invite | NOT IMPLEMENTED — No admin UI to invite clients to the portal |
| Password Reset | NOT TESTED (delegated to Clerk, assumed working) |
| Avatar | NOT TESTED (delegated to Clerk) |
| Account Settings | NOT IMPLEMENTED — No user profile settings page in the admin panel |

**Critical Issue:** `requireAuthenticatedUser()` auto-creates users if they exist in Clerk but not in DB, determining `isInternal` by email domain (`@aarotech.in`). This is a hardcoded heuristic that will fail for any staff member with a different email domain.

---

### 3.2 Organizations

| Check | Result |
|---|---|
| Exists | YES — `/directory/organizations` |
| Reachable | YES |
| CRUD | INCOMPLETE — Create (via lead qualification only), Read (list + detail), Update (NO UI), Delete (NO UI action) |
| Archive | Schema has `deletedAt`, NO admin UI to archive |
| Members | NOT IMPLEMENTED — No UI to add/remove members from an organization |
| Roles | NOT IMPLEMENTED — No UI to change member roles |
| Search | NOT FUNCTIONAL — FilterBar is decorative only |
| Filters | NOT FUNCTIONAL — FilterBar is decorative only |
| Manual Create | NOT IMPLEMENTED — Organizations can only be created via lead qualification |
| Health Score | Rendered in UI but never updated by any service |

---

### 3.3 Contacts

| Check | Result |
|---|---|
| Exists | YES — Schema exists |
| Reachable | NO dedicated /contacts route |
| CRUD | INCOMPLETE — Create (via `qualifyLead`), Read (partial), Update (NO), Delete (NO) |
| Duplicate Detection | Email unique constraint exists in `websiteLeads`, but contacts table has NO unique constraint on email |
| Merge | NOT IMPLEMENTED |
| Activity | NOT IMPLEMENTED |
| Search | NOT IMPLEMENTED |
| Filters | NOT IMPLEMENTED |

**Major Gap:** There is no dedicated Contacts section in the admin panel.

---

### 3.4 Leads

| Check | Result |
|---|---|
| Exists | YES — `/sales/leads` |
| Website Lead | YES — Contact form to DB insert to Email notification |
| Manual Lead | NOT IMPLEMENTED — No "Create Lead" button on the leads page |
| Qualify | YES — `qualifyLeadAction` works |
| Status Filter | Page only shows `status = "new"` leads, "contacted" leads are invisible |
| Import | NOT IMPLEMENTED |
| Edit | NOT IMPLEMENTED |
| Delete | NOT IMPLEMENTED |
| Assignment | NOT IMPLEMENTED |

---

### 3.5 Deals

| Check | Result |
|---|---|
| Exists | YES — `/sales/pipeline`, `/sales/deals/[id]` |
| Create | YES — `createDealAction`, `NewDealModal` |
| Read | YES |
| Update | YES — `updateDealDetailsAction` |
| Delete | NOT IMPLEMENTED — Schema has `deletedAt`, no delete action in UI |
| Pipeline / Drag Drop | YES — `PipelineBoard` with Kanban |
| Stage Update | YES — `updateDealStageAction` |
| Line Items | YES — `addDealLineItemAction`, `removeDealLineItemAction` |
| Probability | NOT IMPLEMENTED — No probability field in schema |
| Forecast | NOT IMPLEMENTED |
| Activities | NOT IMPLEMENTED — No activity log on deal detail |
| Notes | NOT IMPLEMENTED |
| Won / Lost | Won (via proposal acceptance). Lost: NOT IMPLEMENTED |

**Data Issue:** Pipeline page joins `contacts` on `organizations.id = contacts.organizationId` without `LIMIT 1`, meaning an org with multiple contacts creates **duplicate deal rows** in the query result.

---

### 3.6 Proposals

| Check | Result |
|---|---|
| Exists | YES — `/sales/deals/[id]/proposals/[proposalId]` |
| Manual Proposal | NOT IMPLEMENTED — Only "Generate with AI" available, no manual editor |
| AI Proposal | YES — Template-based HTML generation (not real AI — hardcoded template with `setTimeout(1500)`) |
| Edit | NOT IMPLEMENTED — documentData can be regenerated but not manually edited |
| Versioning | NOT IMPLEMENTED — Schema has no proposal version history |
| Preview | YES — HTML rendered in admin + public view |
| Send | YES — `sendProposalAction` sends email via Resend |
| Approve | YES — Public approval page at `/proposals/[proposalId]` |
| Reject | NOT IMPLEMENTED — No rejection workflow |
| Signature | YES — `signatureText` captured |
| Download PDF | NOT IMPLEMENTED — `pdfUrl` field exists in schema but no PDF generation |
| Expiry | YES — `expiresAt` set to 30 days |
| Public Token | SECURITY RISK — No token/HMAC; the proposalId (UUID) IS the access token |

---

### 3.7 Client Portal

| Check | Result |
|---|---|
| Exists | YES — `/portal/*` routes |
| Authentication | YES — `requireAuthenticatedUser()` + client route guard in middleware |
| Proposal View | YES — `/proposals/[proposalId]` (public) |
| Signature | YES — Capture and submit |
| Projects | PARTIAL — Real data, but detail page uses MOCKED data |
| Files / Assets | PARTIAL — `clientAssets` DB table, but UploadThing not connected |
| Invoices | PARTIAL — Shows real invoices, but payment is a MOCK payment (`provider: 'stripe (mock)'`) |
| Payments | PARTIAL — MOCKED payment flow |
| Timeline | NOT IMPLEMENTED |
| Comments | NOT IMPLEMENTED at portal level |
| Magic Link | NOT IMPLEMENTED |
| Onboarding Status | YES — Real data from DB |
| Deliverables Review | YES — `approveDeliverableAction` / `requestRevisionAction` |
| Tenant Isolation | PARTIAL — `getClientMembership` only returns FIRST membership |
| Notifications | YES — Inbox feed from DB |

---

### 3.8 Projects

| Check | Result |
|---|---|
| Exists | YES — `/delivery/projects` |
| Manual Create | NOT IMPLEMENTED — No "Create Project" button on the admin UI |
| Auto Create | YES — Via `ConversionEngine.handleProposalAccepted` |
| Edit | NOT IMPLEMENTED |
| Archive | NOT IMPLEMENTED |
| Members | NOT IMPLEMENTED |
| Progress | NOT IMPLEMENTED |
| Overview | PARTIAL — Overview tab exists but shows placeholder text |

**Note:** `createProjectAction` in `src/actions/projects.ts` and `createProjectFromDeal` in `src/modules/delivery/actions.ts` are **two different, incompatible implementations** of project creation from a deal.

---

### 3.9 Milestones

| Check | Result |
|---|---|
| Exists | YES — Schema + services + `/delivery/projects/[id]/milestones` |
| Create | YES — `createMilestoneAction` |
| Read | YES |
| Update Status | YES — `updateMilestoneStatusAction` |
| Delete | NOT IMPLEMENTED |
| Dependencies | NOT IMPLEMENTED — Schema has no dependency fields |
| Timeline View | NOT IMPLEMENTED |
| Completion | YES — `completedAt` tracked |

---

### 3.10 Tasks

| Check | Result |
|---|---|
| Exists | YES — Schema + services |
| Create | YES — `createTaskAction` |
| Read | YES |
| Update Status | YES — `updateTaskStatusAction`, Kanban board |
| Delete | NOT IMPLEMENTED |
| Assignment | YES — Schema + service |
| Comments | `taskComments` table exists in schema but NO actions or UI |
| Labels | Schema has `labels` (JSONB), no UI to set/filter |
| Attachments | Schema has `attachments` (JSONB), no UI |
| Kanban | YES — `TaskBoard` component |
| Filters | NOT IMPLEMENTED |
| Search | NOT IMPLEMENTED |
| Update Details | NOT IMPLEMENTED — Can only move tasks on board |

---

### 3.11 Deliverables

| Check | Result |
|---|---|
| Exists | YES — Schema + services |
| Create | YES — `createDeliverableService` |
| Edit | NOT IMPLEMENTED |
| Delete | NOT IMPLEMENTED |
| Upload | PARTIAL — UploadThing route exists but deliverable version upload flow is NOT connected end-to-end |
| Download | NOT IMPLEMENTED |
| Approval Workflow | YES — 5-step state machine implemented |
| Versioning | `deliverableVersions` table exists but version upload not connected |

---

### 3.12 UploadThing / Files

| Check | Result |
|---|---|
| Route Exists | YES — `/api/uploadthing/route.ts` |
| Core Config | YES — `src/app/api/uploadthing/core.ts` |
| Upload | NOT TESTED in current session |
| Replace | NOT IMPLEMENTED |
| Delete from Storage | NOT IMPLEMENTED |
| End-to-End UI Flow | NOT IMPLEMENTED — No UI flow: upload → UploadThing callback → files table → deliverable link |
| Download | NOT IMPLEMENTED — No download route, just raw URLs |

---

### 3.13 Manual Finance

| Check | Result |
|---|---|
| Exists | YES — `/finance/invoices` |
| Invoice Create | PARTIAL — `createInvoiceAction` exists but "Create Invoice" button is UNCONNECTED (no form/modal) |
| Invoice Read | YES |
| Invoice Edit | NOT IMPLEMENTED |
| Invoice Delete/Void | NOT IMPLEMENTED in UI |
| Deposit Invoice | YES — Auto-created via `ConversionEngine` |
| Taxes | NOT IMPLEMENTED |
| Discounts | NOT IMPLEMENTED |
| Outstanding Balance | Computed incorrectly — filters wrong status values |
| Partial Payment | Logic exists but `partially_paid` status not in schema comment |
| Full Payment | YES — `recordManualPaymentService` marks as `paid` |
| Payment History | YES — Via project finance page |
| Manual Payment Record | YES — `RecordPaymentDialog` |
| Verify Payment | YES — `verifyManualPaymentAction` |
| Void | NOT IMPLEMENTED in UI |
| Currency Formatting | INCONSISTENCY — Finance page uses $ dollar sign. Should be Rs for Indian context |
| Invoice Number | NOT IMPLEMENTED — No invoice number generation |

---

### 3.14 Activity Timeline

| Check | Result |
|---|---|
| Coverage | PARTIAL — Only project activities logged. Invoice and deliverable events not displayed in unified timeline |
| Ordering | YES — DESC by `createdAt` |
| Duplicates | Risk — `emitDomainEvent` sends to Inngest AND falls back locally in development, potentially logging events twice |
| Filtering | NOT IMPLEMENTED |
| Permissions | NOT VERIFIED |

---

### 3.15 Dashboard

| Check | Result |
|---|---|
| Exists | YES — `/dashboard` |
| KPI Counts | HARDCODED MOCK DATA — `getDashboardMetrics()` in both sales and delivery services return static hardcoded values |
| Finance Metrics | HARDCODED MOCK DATA — `getFinancialMetrics()` returns static mocked values |
| Charts | NOT IMPLEMENTED |
| Quick Actions | "New Invoice" links to `/finance/invoices/new` which does NOT EXIST |

---

### 3.16 Search

| Check | Result |
|---|---|
| Global Search | NOT IMPLEMENTED |
| Module Search | NOT FUNCTIONAL — FilterBar components are decorative, not wired to data |

---

### 3.17 Notifications / Inbox

| Check | Result |
|---|---|
| Schema | YES — `notifications` table with indexes |
| In-App | YES — `sendInAppNotification` stores to DB |
| Admin Inbox | YES — `/inbox` page with read/archive actions |
| Email | YES — Resend integration |
| Client Portal Inbox | `getClientDashboardFeed` queries by `organizationId` but notifications are stored by `userId` |

---

### 3.18 Settings

| Check | Result |
|---|---|
| Company Settings | PARTIAL — Form present |
| Services | NOT IMPLEMENTED — No UI to manage the `services` table |
| Templates | NOT IMPLEMENTED |
| Profile | NOT IMPLEMENTED — No user profile page |
| Roles | NOT IMPLEMENTED — No role management UI |
| Team Members | NOT IMPLEMENTED |

---

## 4. Feature Coverage Matrix

| Feature | Schema | Service | Action | Page | CRUD Complete |
|---|---|---|---|---|---|
| Organizations | YES | YES | PARTIAL | PARTIAL | NO |
| Contacts | YES | PARTIAL | NO | NO | NO |
| Website Leads | YES | YES | YES | YES | PARTIAL |
| Manual Leads | — | — | NO | NO | NO |
| Deals | YES | YES | YES | YES | PARTIAL |
| Proposals | YES | YES | YES | YES | PARTIAL |
| Projects | YES | YES | PARTIAL | PARTIAL | NO |
| Tasks | YES | YES | YES | YES | PARTIAL |
| Milestones | YES | YES | YES | YES | PARTIAL |
| Deliverables | YES | YES | YES | YES | PARTIAL |
| Files/Upload | YES | NO | NO | NO | NO |
| Invoices | YES | YES | YES | PARTIAL | NO |
| Payments | YES | YES | YES | YES | PARTIAL |
| Notifications | YES | YES | YES | YES | YES |
| Activity Logs | YES | PARTIAL | — | NO | NO |
| Services (catalog) | YES | — | — | NO | NO |
| Retainers | YES | — | — | NO | NO |
| Knowledge Base | YES | — | — | NO | NO |
| Audit Logs | YES | PARTIAL | — | NO | NO |

---

## 5. Bugs Found

### CRITICAL (P0 — Ship Blocker)

**BUG-001: Duplicate Export in `finance/actions.ts`**
- File: `src/modules/finance/actions.ts`
- Lines 10 and 60: `recordManualPaymentAction` is exported **twice** with different schemas.
- TypeScript will error. The first export handles `referenceNumber: string.min(1)` (required), the second handles `referenceNumber: string().optional()`. This causes a collision.
- **Impact:** Finance payment recording is broken in production.

**BUG-002: Dashboard Metrics Are Hardcoded Mock Data**
- Files: `src/modules/sales/services.ts` (line 298-331), `src/modules/delivery/services.ts` (line 248-258), `src/modules/finance/services.ts` (line 149-163)
- `getDashboardMetrics()` and `getFinancialMetrics()` return static values. Real clients will see "34 Active Deals" and "$12,000 Revenue This Month" regardless of actual data.
- **Impact:** Executive dashboard is entirely non-functional as a management tool.

**BUG-003: Outstanding Balance Calculation Uses Wrong Status Values**
- File: `src/app/(admin)/finance/page.tsx`, line 24
- Filters `["sent", "viewed", "partially_paid", "overdue"]` but the DB schema default is `"open"`. Invoices in `"open"` status are **excluded** from the outstanding balance calculation.
- **Impact:** Finance page shows incorrect outstanding balance.

**BUG-004: Currency Symbol Mismatch ($ vs Rs)**
- Files: `src/app/(admin)/finance/page.tsx`, `src/app/(admin)/dashboard/page.tsx` use `$`, email templates and proposals use `Rs`
- **Impact:** Aarotech is an Indian agency. Showing `$` in the admin is factually incorrect and confusing.

### HIGH (P1 — Must Fix Before Launch)

**BUG-005: Pipeline Query Produces Duplicate Deals**
- File: `src/app/(admin)/sales/pipeline/page.tsx`, lines 12-28
- LEFT JOIN to `contacts` without `LIMIT 1` or `DISTINCT`. If an organization has 2 contacts, the deal appears twice.

**BUG-006: `createProjectFromDeal` Has Two Incompatible Implementations**
- `src/actions/projects.ts` creates project with status `"active"` and 3 tasks.
- `src/modules/delivery/services.ts::createProjectFromDeal` creates project with status `"pending"` and 1 task.
- ConversionEngine calls the delivery service version. The actions/projects.ts version is dead code that contradicts the service layer.
- **Impact:** Inconsistent project state depending on how project creation is triggered.

**BUG-007: `getClientMembership` Returns Only First Organization**
- File: `src/modules/portal/services.ts`, line 8
- Uses `findFirst` — a client user with access to multiple organizations will always see only the first one.

**BUG-008: Two Parallel Proposal Approval Implementations**
- `src/modules/sales/services.ts` has both `approveProposalByToken` (lines 80-115) and `approveProposalClient` (lines 337-403).
- They do completely different things when a proposal is accepted with no coordination.

**BUG-009: Proposal Token is the UUID — No HMAC/Signature**
- The public proposal approval page at `/proposals/[proposalId]` uses the raw proposal UUID as the access token.
- Anyone who guesses or obtains a UUID can view and sign any proposal.

**BUG-010: `createInvoice` Button is Unconnected**
- File: `src/app/(admin)/finance/page.tsx`, line 40
- The "Create Invoice" button renders with no onClick, no modal, and no server action. It does nothing.

**BUG-011: `deliveryService.ts` Has Duplicate Import Block**
- File `src/modules/delivery/services.ts` has TWO separate import blocks (lines 1-3 and lines 376-378), indicating the file was assembled by concatenating two separate files.

**BUG-012: `sales/services.ts` Also Has Duplicate Import Block**
- File: `src/modules/sales/services.ts` — lines 332-334 begin a second `import { db }` block mid-file.

**BUG-013: Worker Thread Crash on Server Start**
- From the startup log: `[Error: the worker thread exited]` and `Cannot find module '...vendor-chunks/lib/worker.js'`
- This error is thrown repeatedly during dev.

**BUG-014: Double Project Creation Risk**
- `emitDomainEvent` dispatches to Inngest AND also calls `conversionEngine.handleProposalAccepted` locally in development. Combined with `approveProposalClient` also calling its own project creation, this can result in **double project creation** when a proposal is approved in development.

### MEDIUM (P2 — Fix Before Public Launch)

**BUG-015: `getClientInvoices` and `getClientPayments` return MOCKED data**
- `src/modules/finance/services.ts`, lines 165-178. Client portal billing page shows fake invoice data.

**BUG-016: `getClientProjectDetails` returns MOCKED data**
- `src/modules/delivery/services.ts`, lines 270-287. Client project detail is entirely fake.

**BUG-017: `getClientProjects` returns MOCKED data**
- `src/modules/delivery/services.ts`, lines 262-268.

**BUG-018: `processMockPayment` uses `'stripe (mock)'` as provider**
- Client portal payment completes with `provider: 'stripe (mock)'`. No real payment processor is integrated.

**BUG-019: Task board `revalidatePath` uses incorrect path format**
- `revalidatePath('/projects/...')` instead of `revalidatePath('/(admin)/delivery/projects/...')`. Cache will not be invalidated correctly.

**BUG-020: Milestone update has no organization ownership check**
- `updateMilestoneStatusService` — an authenticated internal user can update any milestone regardless of project ownership.

**BUG-021: `deliverables.ts` action uses wrong permission for deliverable creation**
- `src/actions/deliverables.ts`, line 13: `authorize(PERMISSIONS.DEAL_EDIT)` to create a deliverable. Wrong permission used.

**BUG-022: `approveDeliverable` called with wrong column name**
- `src/actions/deliverables.ts`, line 44: `db.select({ organizationId: deliverables.projectId })` — selects `projectId` but names it `organizationId`. This is a **column name bug** that will pass wrong data to the approval function.

---

## 6. Missing Features

### Critical Missing Features (P1)

| ID | Feature | Module |
|---|---|---|
| MF-001 | Real AI proposal generation (GPT/Gemini integration) | Proposals |
| MF-002 | PDF proposal download | Proposals |
| MF-003 | Real payment gateway (Razorpay — schema has `razorpayOrderId`) | Finance |
| MF-004 | File upload end-to-end flow (UI to UploadThing to DB to Deliverable) | Files |
| MF-005 | Global search | Platform |
| MF-006 | Real dashboard metrics (replace all mock data) | Dashboard |
| MF-007 | Client portal invoice payment flow | Client Portal |
| MF-008 | Manual organization creation | Organizations |
| MF-009 | Organization edit/update UI | Organizations |
| MF-010 | Standalone Contacts module | Contacts |
| MF-011 | Manual lead creation | Leads |
| MF-012 | Deal delete / archive | Deals |
| MF-015 | Invoice number generation system | Finance |
| MF-016 | Invoice void / cancel UI | Finance |
| MF-028 | Team management in settings | Settings |
| MF-029 | Services catalog management | Settings |
| MF-030 | Role management UI | Settings |
| MF-031 | Client invite flow (portal access) | Auth |

### High Priority Missing Features (P2)

| ID | Feature | Module |
|---|---|---|
| MF-013 | Proposal manual editor | Proposals |
| MF-014 | Proposal rejection workflow | Proposals |
| MF-017 | Tax / GST on invoices | Finance |
| MF-018 | Discount on invoices | Finance |
| MF-019 | Task comments | Tasks |
| MF-020 | Task edit (title, description, assignee) | Tasks |
| MF-021 | Task delete | Tasks |
| MF-022 | Milestone delete | Milestones |
| MF-023 | Deliverable delete | Deliverables |
| MF-024 | Deliverable download | Deliverables |
| MF-025 | Project manual creation UI | Projects |
| MF-026 | Project edit UI | Projects |
| MF-027 | Project members management | Projects |
| MF-032 | Retainer management UI | Finance |
| MF-034 | Duplicate contact detection/merge | Contacts |
| MF-035 | Proposal versioning | Proposals |

### Low Priority Missing Features (P3)

| ID | Feature | Module |
|---|---|---|
| MF-033 | Lead import (CSV) | Leads |

---

## 7. UI/UX Issues

| ID | Issue | Location | Severity |
|---|---|---|---|
| UX-001 | FilterBar is decorative — search/filter does nothing | All listing pages | HIGH |
| UX-002 | "Create Invoice" button has no action | `/finance` page | HIGH |
| UX-003 | "New Invoice" dashboard quick action links to non-existent `/finance/invoices/new` | Dashboard | HIGH |
| UX-004 | "New Project" dashboard quick action links to non-existent `/delivery/projects/new` | Dashboard | HIGH |
| UX-005 | Leads page only shows `status = "new"`, "contacted" leads invisible | `/sales/leads` | MEDIUM |
| UX-006 | Project overview tab shows placeholder text only | `/delivery/projects/[id]` | MEDIUM |
| UX-007 | No loading state for server actions (no pending indicators on form buttons) | Forms/Actions | MEDIUM |
| UX-008 | No confirmation dialogs before destructive actions | Platform-wide | MEDIUM |
| UX-009 | No breadcrumb on the client portal | Client Portal | LOW |
| UX-010 | Task board has no "Create Task" button or modal | Board | HIGH |
| UX-011 | Automations page lists workflows as hardcoded | Automations | LOW |
| UX-012 | Currency displayed as `$` in admin (should be Rs for INR) | Finance, Dashboard | HIGH |
| UX-013 | No pagination on any listing table | All tables | MEDIUM |
| UX-014 | Status badges use hardcoded green for all statuses regardless of value | Organizations | MEDIUM |
| UX-015 | Health score shows progress bar that never updates | Organizations | MEDIUM |

---

## 8. Consistency Issues

| ID | Issue | Severity |
|---|---|---|
| CON-001 | Currency symbol: `$` in UI vs Rs in emails vs Rs in proposals | CRITICAL |
| CON-002 | Amount units: Some functions use cents (x100), others use dollars. No consistent money type | HIGH |
| CON-003 | Invoice status vocabulary: `"open"` (schema default) vs `"issued"` (Finance service) vs `"sent"` vs `"viewed"` | HIGH |
| CON-004 | Project status vocabulary: schema allows `"active"`, service allows `"pending"/"planned"/"on_hold"`, actions create with `"active"` directly bypassing state machine | HIGH |
| CON-005 | `revalidatePath` paths inconsistent: some use `/(admin)/...`, some use `/admin/...`, some use bare `/...` | MEDIUM |
| CON-006 | `require()` mixed with `import` throughout service files | MEDIUM |
| CON-007 | `.tmp` files committed to repo (`actions.ts.tmp`, `services.ts.tmp`) in delivery and finance modules | MEDIUM |
| CON-008 | `createProjectFromDeal` function exists in two incompatible locations | HIGH |
| CON-009 | `approveProposalByToken` vs `approveProposalClient` — duplicate approval flows | CRITICAL |

---

## 9. Security Findings

| ID | Finding | Severity |
|---|---|---|
| SEC-001 | Proposal access requires only UUID — no HMAC token, no authentication for public proposal view | HIGH |
| SEC-002 | `updateMilestoneStatusService` has no organization ownership check | MEDIUM |
| SEC-003 | `updateDealDetailsService` uses raw `require()` and has no organization ownership check | MEDIUM |
| SEC-004 | `qualifyLeadAction` passes `internalUserId` to SalesRepo but ownerId field on deal is not verified | LOW |
| SEC-005 | Internal user detection via email domain (`@aarotech.in`) in `auth.ts` can be bypassed | HIGH |
| SEC-006 | `approveProposalClient` does not check that the calling user has rights to the organization | HIGH |
| SEC-007 | `processMockPayment` checks org match without enforcing membership | MEDIUM |
| SEC-008 | `tenantActionClient` Clerk orgId mapping to internal organizations table is NOT enforced in the action client | HIGH |
| SEC-009 | No CSRF protection beyond Next.js defaults | LOW |
| SEC-010 | Webhook signature verification is implemented correctly (Svix) | PASS |

---

## 10. Database Findings

| ID | Finding | Severity |
|---|---|---|
| DB-001 | `contacts` table has no unique constraint on `email` — duplicate contacts can be created | HIGH |
| DB-002 | `invoices` schema comment says `draft, open, paid, void` but code uses `issued`, `sent`, `viewed`, `partially_paid`, `archived`, `voided` | HIGH |
| DB-003 | `deliverables.currentVersionId` column has no foreign key reference to `deliverableVersions.id` | MEDIUM |
| DB-004 | `activityLogsRelations` relation name mismatch — `projectActivities` relation will not work correctly since activityLogs has no `projectId` FK | HIGH |
| DB-005 | `payments.providerPaymentId` UNIQUE constraint will throw on multiple null payments (NULL uniqueness in Postgres) | MEDIUM |
| DB-006 | `organizations.clerkOrgId` uses `pending_org_` prefix for leads/prospects that will never be cleaned up if rejected | MEDIUM |
| DB-007 | No `updatedAt` tracking in `contacts` table | LOW |
| DB-008 | `milestones` table has `updatedAt` column but no `updatedBy` tracking | LOW |
| DB-009 | `tasks` table has `updatedBy` but no actual update service sets it on normal status changes | LOW |
| DB-010 | `automationLogs.organizationId` does not exist — jobs cannot be filtered by tenant | MEDIUM |
| DB-011 | Dual event dispatch in development mode can create duplicate projects when a proposal is accepted | HIGH |

---

## 11. Performance Findings

| ID | Finding | Severity |
|---|---|---|
| PERF-001 | Pipeline page: contact JOIN without LIMIT causes multiple contacts to multiply deal rows | HIGH |
| PERF-002 | Dashboard page: 4 concurrent DB calls but 3 of them return hardcoded data — performance will degrade when real queries are implemented | MEDIUM |
| PERF-003 | Client portal Redis cache (1-hour TTL) is never invalidated when new invoices/projects are created | MEDIUM |
| PERF-004 | `getProjectsService` without `organizationId` does a full table scan on all projects | MEDIUM |
| PERF-005 | Bundle size not analyzed | LOW |
| PERF-006 | No database connection pooling configuration visible | LOW |

---

## 12. Technical Debt

| ID | Debt Item | Files | Severity |
|---|---|---|---|
| TD-001 | `.tmp` files committed to main branch | `delivery/actions.ts.tmp`, `delivery/services.ts.tmp`, `finance/actions.ts.tmp`, `finance/services.ts.tmp` | HIGH |
| TD-002 | `require()` used inside async service functions instead of `import` | Multiple service files | HIGH |
| TD-003 | Duplicate implementation of `createProjectFromDeal` | `src/actions/projects.ts` vs `src/modules/delivery/services.ts` | HIGH |
| TD-004 | Two conflicting proposal approval flows | `approveProposalByToken` vs `approveProposalClient` | HIGH |
| TD-005 | All dashboard metrics functions return hardcoded mock data | 3 service files | CRITICAL |
| TD-006 | `src/modules/delivery/services.ts` is a concatenation of two separate files | delivery/services.ts | HIGH |
| TD-007 | `src/modules/sales/services.ts` also has two import blocks | sales/services.ts | HIGH |
| TD-008 | `src/test-workflow.ts` file committed at root of `src/` | src/test-workflow.ts | MEDIUM |
| TD-009 | `PERMISSIONS.DEAL_EDIT` used as authorization for deliverable creation | src/actions/deliverables.ts | MEDIUM |
| TD-010 | No centralized money/currency type — amounts sometimes cents, sometimes dollars | Platform-wide | HIGH |
| TD-011 | `src/actions/` folder is a parallel action layer that duplicates module-level `actions.ts` files | src/actions/ | MEDIUM |
| TD-012 | Comment in `qualifyLead` says "Wait, should it be prospect?" — uncommitted design question in production code | sales/services.ts line 35 | LOW |

---

## 13. Regression Risks

| Risk | Description | Likelihood |
|---|---|---|
| REGR-001 | Fixing `finance/actions.ts` duplicate export will change which `recordManualPaymentAction` is used | HIGH |
| REGR-002 | Replacing mock dashboard metrics with real queries will surface DB schema mismatches | MEDIUM |
| REGR-003 | Implementing correct invoice status tracking (`open` vs `issued`) may invalidate existing invoice data | HIGH |
| REGR-004 | Removing duplicate project creation flows may break existing ConversionEngine behavior | MEDIUM |
| REGR-005 | Adding proposal HMAC token will break all existing sent proposal links | HIGH |
| REGR-006 | Fixing `revalidatePath` paths may cause unexpected cache behavior during rollout | LOW |

---

## 14. Priority Matrix

### P0 — Ship Blockers (Must Fix Before Any Release)

1. BUG-001: Duplicate export in `finance/actions.ts`
2. BUG-002: All dashboard metrics are hardcoded mock data
3. BUG-003: Outstanding balance calculation uses wrong status
4. BUG-004: Currency symbol is `$` not Rs
5. BUG-008: Two conflicting proposal approval flows
6. BUG-014: Double project creation risk in development

### P1 — Pre-Launch Required

7. BUG-005: Pipeline query duplicate rows
8. BUG-006: Duplicate `createProjectFromDeal` implementations
9. BUG-010: Create Invoice button is unconnected
10. BUG-013: Worker thread crash on server start
11. BUG-015 through BUG-017: Client portal using mock data
12. MF-001 through MF-007: Real AI, PDF export, real payment, file upload, search, real metrics, client payment
13. MF-008 through MF-012: Org edit, contacts module, manual lead, deal delete
14. MF-028 through MF-031: Team management, services catalog, role management, client invite
15. SEC-001: Proposal HMAC token
16. SEC-005: Email domain heuristic for internal user detection
17. TD-001: Delete `.tmp` files from repo
18. TD-002: Replace `require()` with `import`
19. CON-001: Currency symbol consistency
20. CON-003: Invoice status vocabulary alignment

---

## 15. Recommended Fix Order (Stabilization Sprint)

### Day 1: Critical Crash Fixes
1. Delete `.tmp` files (TD-001)
2. Fix duplicate export in `finance/actions.ts` (BUG-001)
3. Consolidate `createProjectFromDeal` into single implementation (BUG-006, TD-003)
4. Consolidate `approveProposalByToken` vs `approveProposalClient` into single flow (BUG-008, CON-009)
5. Fix currency symbol throughout admin UI to Rs (BUG-004, CON-001)

### Day 2: Data Integrity and Status Alignment
6. Align invoice status vocabulary (`open` as the unified open state) (CON-003)
7. Fix outstanding balance calculation (BUG-003)
8. Fix pipeline query duplicate rows (BUG-005)
9. Add unique constraint on `contacts.email` per org (DB-001)
10. Fix `deliverables.ts` wrong column name bug (BUG-022)

### Day 3: Replace Mock Data
11. Implement real `getDashboardMetrics()` (Sales, Delivery, Finance) (BUG-002)
12. Connect `getClientInvoices`, `getClientPayments` to real DB (BUG-015)
13. Connect `getClientProjects`, `getClientProjectDetails` to real DB (BUG-016, BUG-017)
14. Connect "Create Invoice" button to modal/form (BUG-010)

### Day 4: Security and Auth
15. Add HMAC token to proposal access (SEC-001)
16. Replace email-domain internal user heuristic with Clerk metadata (SEC-005)
17. Add org ownership check to milestone and deal update services (SEC-002, SEC-003)
18. Fix `revalidatePath` paths to use correct route group format

### Day 5: Missing Critical Features
19. Implement client invite flow
20. Implement manual organization creation
21. Implement task edit/delete modal
22. Implement invoice number generation

---

## 16. GO / CONDITIONAL GO / NO-GO Recommendation

**VERDICT: NO-GO**

The Aarotech Agency OS **cannot be shipped to real paying clients** in its current state.

### Rationale:

1. **Financial module is broken** — The "Create Invoice" button does nothing, currency symbols are wrong (showing `$` for INR amounts), and the outstanding balance calculation is incorrect.

2. **Dashboard is fake** — Every KPI shown on the executive dashboard is hardcoded static data. A client-facing SaaS showing fake metrics is a liability.

3. **Client portal shows mock data** — Clients logging into their portal will see fake invoices, fake project data, and a broken payment flow (`provider: 'stripe (mock)'`).

4. **Critical code collision** — The duplicate `recordManualPaymentAction` export will cause a module-level crash under certain import conditions.

5. **Two conflicting proposal approval flows** — An approved proposal may or may not trigger project creation depending on which flow path is taken, creating unpredictable behavior.

6. **No real payment gateway** — Despite the schema having Razorpay fields, there is zero Razorpay integration. Client billing is a mock.

7. **Security gaps** — Proposal access requires only a UUID (no HMAC). Internal user detection relies on an email domain check that can be trivially bypassed.

### Conditional GO Criteria:

The system CAN be released after completing the P0 and P1 items from the Recommended Fix Order above. Specifically, the following gates must pass before a release:

- [ ] `finance/actions.ts` duplicate export resolved
- [ ] All dashboard metrics are real database queries
- [ ] Currency symbols are consistent (Rs throughout)
- [ ] Invoice status vocabulary is aligned
- [ ] Client portal shows real invoice and project data
- [ ] "Create Invoice" button is functional
- [ ] Pipeline query does not produce duplicate rows
- [ ] Proposal approval has a single flow
- [ ] At least one real payment method integrated
- [ ] HMAC proposal token implemented

**Estimated stabilization sprint time: 5-7 days of focused engineering work.**

---

*This document was produced by automated codebase audit. All findings are based on static analysis of source code as committed on 2026-07-23 (commit `8aefdd6`). Dynamic runtime testing of each flow is recommended in addition to this audit.*
