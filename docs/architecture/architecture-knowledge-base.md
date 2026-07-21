# Aarotech Enterprise Platform — Architecture Knowledge Base (AKB)

**Role:** Documentation Architect  
**Status:** Living Document (Continuously Updated)

This document is the permanent knowledge base recording every approved architectural decision for the Aarotech platform. It serves as the single source of truth for all current and future engineers, ensuring that historical context and design reasoning are never lost.

---

## 1. Project Overview

- **Vision:** To provide a unified, automated, and secure Enterprise Platform for digital marketing and development agencies, handling the complete lifecycle from Lead capture to Deliverable approval and Payment.
- **Goals:** 0 data leaks, < 1 second latency, and a frictionless experience for both internal agency staff and external clients.
- **Technology Stack:** Next.js (App Router), Neon (Serverless Postgres), Drizzle ORM, Clerk (Auth), Stripe (Payments), UploadThing (Files), Resend (Emails), Trigger.dev (Background Jobs).
- **Core Principles:** Native Tenant Isolation (`organizationId`), Event-Driven Mutations, Strict Bounded Contexts, and "CRUD++" Operations.
- **Current Status:** Phase 1 (Architecture & Product Specification) complete. Ready for Development (Milestone 1).

---

## 2. Approved Documents Index

| Name | Purpose | Version | Status | Date |
| :--- | :--- | :--- | :--- | :--- |
| **Technical Design Document (TDD)** | Initial high-level DB and flow architecture. | v1.0 | Approved | 2026-07-20 |
| **Product UX & IA Audit** | Overhaul of the information architecture from CRM monolith to Workspaces. | v2.0 | Approved | 2026-07-21 |
| **Product Requirements Document (PRD)** | Exhaustive spec of every page, user action, and UI element. | v1.0 | Approved | 2026-07-21 |
| **Data Operations Spec** | Rules for Entity lifecycles, CRUD++, versioning, and undo/rollback. | v1.0 | Approved | 2026-07-21 |
| **Engineering Architecture Guide (EAIG)** | Developer blueprint for repo structure, Server Actions, and DDD. | v1.0 | Approved | 2026-07-21 |
| **Master Development Plan (MDP)** | Single execution roadmap synthesizing all specs into Sprints. | v1.0 | Approved | 2026-07-21 |

---

## 3. Architecture Decision Records (ADR)

### ADR-001: Move from CRM Monolith to Workspace Architecture
- **Context:** The original routing assumed all post-sales operations (Projects, Invoices) belonged under a `/crm` umbrella.
- **Options Considered:** 1) Keep the monolith for simplicity. 2) Split into strict role-based workspaces.
- **Decision Taken:** Split the app into strict bounded contexts: Sales, Delivery, Finance, Directory, and Client Hub.
- **Reasoning:** CRM implies pre-sales. Project Managers and Accountants suffer cognitive overload if forced into a sales namespace. Workspaces provide clean separation of concerns.
- **Consequences:** Requires refactoring the Next.js `app` router structure. Greatly improves UX and scalability.
- **Future Revisit Required:** No.

### ADR-002: Strict Tenant Isolation via Row-Level Validation
- **Context:** Ensuring no client data bleeds across organizations.
- **Decision Taken:** Every DB table containing client data MUST have an `organization_id` column. Every read/write query MUST filter by `organization_id`.
- **Reasoning:** Application-level tenant checks are the most robust way to prevent IDOR vulnerabilities in B2B SaaS without complex Row Level Security (RLS) DB configurations.

### ADR-003: The Universal Server Action Wrapper
- **Context:** Next.js Server Actions are inherently insecure endpoints.
- **Decision Taken:** No raw Server Actions are allowed. All mutations must use a `createSafeAction` wrapper.
- **Reasoning:** Centralizes Auth, RBAC, Tenant Validation, Error Handling, and Audit Logging.

### ADR-004: Event-Driven Conversion Engine
- **Context:** When a proposal is signed, a project and invoice must be created.
- **Decision Taken:** The `SalesService` emits a `ProposalAccepted` event via an outbox/queue. Background workers handle the Project creation.
- **Reasoning:** Decouples the Sales module from the Delivery module, preventing circular dependencies and slow UI responses.

---

## 4. Product Evolution Timeline

- **Start:** Conceived as a monolithic "CRM" handling everything.
- **↓ Evolution 1:** Realized Operations and Finance need separation. Split into Workspaces.
- **↓ Evolution 2:** Added the "Directory" as the foundational dependency (Organizations).
- **↓ Evolution 3:** Introduced the "Conversion Engine" to bridge Sales and Delivery via Events.
- **↓ Evolution 4:** Elevated Data Ops: Replaced basic CRUD with "CRUD++" (Archiving, Soft Deletes, Locking, Versioning).
- **↓ Evolution 5:** Implemented the Universal Server Action Wrapper for strict security.

---

## 5. Module Registry

| Module | Purpose | Owner | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Core** | Auth, SafeActions, Event Bus, DB | Architecture Team | None | Spec |
| **Directory** | Tenant root (Organizations, Contacts) | Product Team | Core | Spec |
| **Sales** | Leads, Deals, Proposals | Product Team | Directory, Core | Spec |
| **Finance** | Invoices, Payments, Stripe | Product Team | Directory, Core | Spec |
| **Delivery** | Projects, Tasks, Deliverables | Product Team | Directory, Core | Spec |

---

## 6. Entity Registry

| Entity | Purpose | Lifecycle | Relationships | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Organization** | Root tenant boundary | Active -> Deactivated | 1:M Deals, Projects, Invoices | Spec |
| **Deal** | Sales opportunity | Discovery -> Won/Lost | Belongs to Org, 1:1 Proposal | Spec |
| **Proposal** | Contract | Draft -> Sent -> Accepted | Belongs to Deal | Spec |
| **Project** | Delivery container | Pending -> Active -> Archived | Belongs to Org, 1:M Tasks | Spec |
| **Deliverable** | Client review item | Draft -> Review -> Approved | Belongs to Project | Spec |
| **Invoice** | Revenue collection | Draft -> Open -> Paid/Void | Belongs to Org, 1:M Payments | Spec |

---

## 7. Component Registry

| Component | Purpose | Props | Status |
| :--- | :--- | :--- | :--- |
| **DataTable** | Universal list view | `columns`, `data`, `pagination`, `sorting` | Spec |
| **KanbanBoard** | Drag-and-drop pipeline | `lanes`, `cards`, `onDragEnd` | Spec |
| **Uploader** | S3 File Upload UI | `endpoint`, `maxFiles`, `onComplete` | Spec |
| **ActivityTimeline** | Audit visualizer | `events` (Array of Activity objects) | Spec |
| **CommandPalette** | Global Cmd+K Search | `open`, `onSelect` | Spec |

---

## 8. API Registry

| API (Webhook) | Purpose | Permissions | Status |
| :--- | :--- | :--- | :--- |
| `/api/webhooks/clerk` | Syncs User/Org creation from Clerk to Neon DB | Clerk Signature Validation | Spec |
| `/api/webhooks/stripe` | Marks Invoices Paid based on Stripe events | Stripe Signature Validation | Spec |
| `/api/uploadthing` | Generates presigned URLs for direct S3 uploads | Auth Token Validation | Spec |

---

## 9. Event Registry

| Domain Event | Producer | Consumer (Worker) | Idempotency | Status |
| :--- | :--- | :--- | :--- | :--- |
| `DealWon` | Sales | Delivery (Creates Project) | Handled by Event ID in DB | Spec |
| `ProposalAccepted` | Sales | Finance (Creates Deposit) | Handled by Event ID in DB | Spec |
| `DeliverableApproved` | Client Hub | Delivery (Updates Project Progress) | Check if already Approved | Spec |
| `InvoicePaid` | Finance | Delivery (Unblocks Project) | Check Stripe Event ID | Spec |

---

## 10. Decision Log (Historical)

*Currently, all decisions are active. No decisions have been superseded or deprecated yet.*

---

## 11. Change Log

| Version | Date | Author | Summary | Affected Docs |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-21 | Doc Architect | Initial creation of the AKB | All |

---

## 12. Future Ideas

*(Not yet approved for development)*
- **AI Proposal Generator:** LLM integration to draft SOWs based on Deal notes.
- **Client In-App Messaging:** Replacing Slack/Email with an internal chat widget.
- **Custom Client Domains:** Allowing agencies to host the Client Hub on `portal.agency.com`.
- **Presence Indicators:** Showing avatars of users currently viewing the same document (Live Collaboration).

---

## 13. Glossary

- **Workspace:** A dedicated, domain-specific UI (e.g., Sales, Delivery) designed to isolate focus.
- **Client Hub:** The external-facing portal where end-clients approve work and pay bills.
- **Lead:** An unqualified prospect.
- **Opportunity/Deal:** A qualified prospect moving through the sales pipeline.
- **Deliverable:** A distinct piece of work requiring internal or external approval.
- **Organization:** The root database tenant. Every client is an Organization.
- **Soft Delete:** Marking a record `deleted_at = NOW()` instead of removing it from the database.
- **CRUD++:** The enterprise extension of basic CRUD, including Archiving, Locking, Restoring, and Versioning.
- **Rollback:** Reverting an entity's data to a historical state based on Audit logs.
