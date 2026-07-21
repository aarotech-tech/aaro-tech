# Aarotech Enterprise Platform — Engineering Architecture & Implementation Guide (EAIG)

**Role:** Principal Software Architect  
**Status:** Approved for Implementation

This document serves as the definitive engineering blueprint. It does not repeat product requirements or business rules; instead, it prescribes *exactly how* the system must be built, structured, and maintained to ensure enterprise-grade scalability, modularity, and developer experience.

---

## 1. Repository Architecture (Next.js App Router)

We are adopting a strict separation of concerns. The `app` directory is strictly for routing and UI composition. All business logic lives in `src/modules`.

```text
src/
├── app/                      # Next.js Routing ONLY (UI composition)
│   ├── (admin)/              # Admin Route Group
│   │   ├── sales/            # Maps to Sales Workspace UI
│   │   ├── delivery/         # Maps to Delivery Workspace UI
│   │   └── finance/          # Maps to Finance Workspace UI
│   ├── (client)/             # Client Hub Route Group
│   │   └── portal/
│   └── api/                  # Webhooks (Clerk, Stripe, UploadThing)
├── components/               # Shared UI Components (Dumb components)
│   ├── ui/                   # shadcn/ui generic primitives
│   └── shared/               # Cross-domain complex components (e.g., GlobalSearch)
├── modules/                  # Domain-Driven Bounded Contexts (The Core)
│   ├── sales/                # Domain: Leads, Deals, Proposals
│   ├── delivery/             # Domain: Projects, Tasks, Deliverables
│   ├── finance/              # Domain: Invoices, Payments
│   ├── directory/            # Domain: Organizations, Contacts
│   └── core/                 # Cross-cutting infrastructure
│       ├── auth/
│       ├── db/               # schema.ts, migrations, base connection
│       ├── events/           # Event Bus / Queue interfaces
│       └── actions/          # The universal Server Action wrapper
```

**Inside each `modules/[domain]/` folder:**
- `actions.ts`: Public mutations exposed to the UI (Server Actions).
- `services.ts`: Pure business logic (does not know about HTTP or Next.js).
- `repositories.ts`: Database access layer (the *only* place Drizzle is called for this domain).
- `events.ts`: Domain event definitions and handlers.
- `validation.ts`: Zod schemas for the domain.

---

## 2. Domain Driven Design (Bounded Contexts)

The system is split into strict bounded contexts. 

1. **Sales:** Owns Leads, Deals, Proposals.
2. **Delivery:** Owns Projects, Tasks, Deliverables, Versions.
3. **Finance:** Owns Invoices, Payments, Stripe integrations.
4. **Directory:** Owns Organizations, Contacts (The root tenant entities).
5. **Core/Identity:** Clerk abstractions, RBAC, tenant context.

*Rule:* A bounded context completely encapsulates its data. The Delivery module does not query the Invoice table directly; it must use a public service exposed by the Finance module.

---

## 3. Module Dependency Rules

- **Allowed Flow:** `app/` -> `modules/[domain]/actions.ts` -> `modules/[domain]/services.ts` -> `modules/[domain]/repositories.ts`.
- **Cross-Domain Communication:** A module can only call the `services.ts` of another module. It **cannot** import a repository from another domain.
- **Dependency Hierarchy:** 
  - `Directory` is foundational (everyone depends on it).
  - `Sales`, `Delivery`, `Finance` depend on `Directory`.
  - `Finance` does not depend on `Delivery` (Decoupled via Events).
- **Forbidden:** Circular dependencies (e.g., Sales -> Delivery -> Sales). Prevented via ESLint `import/no-cycle`.

---

## 4. Database Layer (Drizzle ORM)

- **Repositories:** All DB calls are abstracted behind repository functions (e.g., `findInvoiceById(id, orgId)`).
- **Tenant Validation:** Every query *must* accept and enforce `organizationId`. Never query just by `id` for tenant data.
- **Optimistic Locking:** Update repositories must increment and check the `version` (or `updated_at`) column. If rows affected = 0, throw a `ConcurrencyError`.
- **Soft Delete:** Implemented at the repository layer. `deleted_at IS NULL` is automatically appended to `find*` queries. `delete*` functions perform an `UPDATE deleted_at = NOW()`.
- **Transactions:** Complex operations (e.g., converting a Deal to a Project) must pass a DB transaction object down to the repository layer.

---

## 5. Server Action Architecture

Never write a raw Next.js Server Action. All actions must be wrapped in `createSafeAction` (using `next-safe-action` or a custom wrapper).

**The Universal Wrapper (`src/modules/core/actions/safe-action.ts`) handles:**
1. **Authentication:** Extracts the user session.
2. **Tenant Validation:** Asserts the user belongs to the requested `organizationId`.
3. **Validation:** Parses input using Zod schemas.
4. **Error Handling:** Catches standard errors (`NotFoundError`, `ConcurrencyError`) and formats them for the UI.
5. **Logging:** Logs the action attempt and result.
6. **Audit Trail:** Auto-generates an immutable audit record on success.

```typescript
export const createProjectAction = createSafeAction(
  CreateProjectSchema,
  async (input, ctx) => {
    // ctx contains verified userId and organizationId
    return await DeliveryService.createProject(input, ctx.organizationId);
  }
);
```

---

## 6. Event System

We decouple domains using **Domain Events**.

- **Pattern:** Transactional Outbox or In-Memory Queue (e.g., `Trigger.dev`).
- **Flow:** 
  1. `SalesService` creates a Project and inserts an `Event(type: 'DealWon')` into the `outbox` table in the *same DB transaction*.
  2. A background worker polls the outbox and routes the event to `DeliveryEventHandler`.
- **Idempotency:** Background workers track processed event IDs to ensure side effects (like sending emails) happen exactly once.

---

## 7. Permission Framework

- **Role Hierarchy:** Owner > Admin > Member > ClientAdmin > ClientMember.
- **Row-Level Validation:** Enforced in Repositories (`where orgId = ?`).
- **Action-Level Validation:** Enforced in the Server Action wrapper via an RBAC middleware (`requireRole(['admin', 'owner'])`).

---

## 8. UI Architecture

- **Layouts:** Persistent sidebars and headers. Nested layouts handle data fetching for a specific context (e.g., `/projects/[id]/layout.tsx` fetches the project once).
- **Data Fetching:** React Server Components (RSCs) fetch data directly from `repositories`.
- **Interactivity:** Push state down to leaf Client Components. Do not make entire pages `"use client"`.
- **Drawers/Dialogs:** Managed via URL query parameters (`?modal=new-task`) to ensure deep-linking and back-button support, rather than hidden React state.

---

## 9. Component Library (shadcn/ui + Tailwind)

- All components are strictly functional and stateless (presentational).
- **Standard Props:** Every component supports `isLoading`, `isDisabled`, and standard ARIA accessibility props.
- **Variants:** Managed via `class-variance-authority` (cva).
- No custom CSS. Only Tailwind utility classes.

---

## 10. Data Tables

Every table uses `@tanstack/react-table` heavily abstracted into a generic `<DataTable />` component.
- **Features:** Server-side pagination, sorting, and filtering via URL query params (`?page=1&sort=desc&status=active`).
- **Bulk Actions:** A floating action bar appears when rows are selected, passing an array of IDs to a Server Action.

---

## 11. Forms

- **Library:** `react-hook-form` + `@hookform/resolvers/zod`.
- **Validation:** Shared Zod schema between Client (instant feedback) and Server (Action wrapper).
- **Submission:** Buttons must show a loading spinner and disable themselves during Server Action execution.
- **Success:** Triggers a toast and `revalidatePath()` to update RSCs.

---

## 12. Search Architecture

- **Global Search:** Powered by a Postgres `tsvector` index or a dedicated service like Algolia. Exposed via a Cmd+K Command Palette (`cmdk` library).
- **Local Search:** Debounced input updating a `?q=` URL parameter, triggering a server re-render of the table.

---

## 13. Notification System

- **In-App:** A bell icon fetching from a `notifications` table. Real-time updates via WebSockets (Pusher) or Polling (SWR/React Query).
- **Email:** Transactional emails sent via Resend. Email templates built with `react-email` and stored in `src/modules/core/notifications/templates`.

---

## 14. File Architecture

- **Storage:** UploadThing (S3 wrapper).
- **Structure:** Files are stored under paths matching their tenant context: `orgs/{orgId}/projects/{projectId}/{filename}`.
- **Permissions:** Presigned URLs expire after 1 hour. Downloads requested via an authenticated API route proxy.

---

## 15. Logging & 16. Observability

- **Application Logs:** Structured JSON logging (Pino) pushed to Datadog/Axiom.
- **Audit Logs:** Immutable DB table recording `{ actorId, action, entity, previousState, newState }`.
- **Error Tracking:** Sentry initialized on both Client and Server.
- **Performance:** Vercel Analytics / Speed Insights.

---

## 17. Testing Strategy

- **Unit Tests:** Vitest for Domain Services and Utilities.
- **Integration Tests:** Vitest + Test Database for Repositories and Server Actions (testing transactions and row-level security).
- **E2E Tests:** Playwright for critical user journeys (e.g., Client Approving a Deliverable).

---

## 18. CI/CD Pipeline

- **Branching:** GitHub Flow (Feature branches -> PR -> Main).
- **Checks:** Husky pre-commit hooks (Prettier, ESLint, TypeScript compilation). GitHub Actions runs tests and Drizzle linting.
- **Deployments:** Vercel Preview deployments for every PR. Merge to `main` triggers production deployment. Database migrations (`drizzle-kit push` or `migrate`) run during the build step.

---

## 19. Engineering Standards

- **TypeScript:** Strict mode enabled. No `any` types. Avoid enums (use union types or const objects).
- **Naming:** 
  - Folders/Files: `kebab-case` (e.g., `create-project.ts`).
  - Components: `PascalCase` (e.g., `ProjectCard.tsx`).
  - Variables/Functions: `camelCase`.
- **Server Actions:** Must be named as verbs (e.g., `createProject`, not `ProjectCreation`).

---

## 20. Feature Development Workflow

1. **Idea & Spec:** Review PRD/EAIG.
2. **Database:** Update `schema.ts`, generate Drizzle migration.
3. **Backend:** Write Repository function -> Write Domain Service -> Write Server Action wrapper.
4. **Frontend:** Build Server Component for data fetching -> Build Client Component for interactivity.
5. **Tests:** Write integration test for the action.
6. **Review:** Open PR. Ensure checklist is met.
7. **Deployment:** Merge and monitor Sentry for new errors.

---

## 21. Engineering Pre-Merge Checklist

- [ ] Does the Server Action use the `createSafeAction` wrapper?
- [ ] Is `organizationId` explicitly checked in the repository query?
- [ ] Is there a loading state for the UI?
- [ ] Are errors handled gracefully via Toasts?
- [ ] Did you add an Activity log entry (if applicable)?
- [ ] Is the Drizzle migration generated and tested?
- [ ] Are dependencies contained (e.g., Sales module doesn't import from Delivery module)?
