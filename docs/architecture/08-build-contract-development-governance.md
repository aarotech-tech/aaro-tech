# Build Contract & Development Governance (BCDG)

This document serves as the **permanent constitution governing all future development** for the Aarotech Enterprise Platform. It defines the absolute rules that every implementation must obey. It acts as the binding contract between Product and Engineering.

Its explicit purpose is to prevent:
*   **Architecture drift** (deviating from established patterns)
*   **Duplicated implementations** (re-inventing wheels)
*   **AI hallucinating new structures** (arbitrary generation of non-standard code)
*   **Inconsistent UI** (straying from the design system)
*   **Security regressions** (bypassing established checks)
*   **Technical debt** (taking undocumented shortcuts)

---

## 1. Source of Truth Hierarchy

In the event of a conflict or disagreement between different documentation sources, the following hierarchy strictly applies. The document higher in the list **always** wins.

1.  **Architecture Knowledge Base (AKB)** (`architecture-knowledge-base.md`): The absolute source of truth for all architectural decisions, design patterns, and systemic rules.
2.  **Build Contract & Development Governance (BCDG)**: This document. Defines the immutable rules of engagement for engineering.
3.  **Engineering Architecture Guide (EAIG)** (`05-engineering-architecture-guide.md`): Defines the specific technical implementation details, frameworks, and structural rules.
4.  **Engineering Execution Blueprint (EEB)** (`07-engineering-execution-blueprint.md`): The tactical guide for how to build features within the architecture.
5.  **Technical Design Document (TDD)** (`01-technical-design-document.md`): Feature-specific technical designs.
6.  **Product Requirements Document (PRD)** (`03-product-requirements-document.md`): Feature requirements and user stories.
7.  **Master Development Plan (MDP)** (`06-master-development-plan.md`): Scheduling and sequencing of work.

**Conflict Resolution:** If a PRD requires a feature that contradicts the AKB or BCDG, the PRD is invalid and must be updated. Engineering must push back on any request that violates the top two tiers.

---

## 2. Engineering Rules

The following engineering rules are **MANDATORY** and cannot be bypassed.

*   **No feature may bypass repositories:** All data access must flow through the designated repository layer. Direct database calls from services or controllers are strictly forbidden.
*   **No raw SQL outside repositories:** Raw SQL, if absolutely necessary, is quarantined exclusively within the repository layer. ORMs/query builders are strongly preferred.
*   **No UI business logic:** The UI layer (components, pages) is strictly for presentation. All business logic must reside in shared services or server actions.
*   **No duplicated validation:** Validation rules must be defined centrally (e.g., using Zod schemas) and applied consistently on both the client (forms) and server (API/actions).
*   **No duplicated state machines:** Complex states must be managed centrally, not re-implemented across different components.
*   **No duplicated permission checks:** Authorization logic must use central RBAC utilities. Do not hardcode permission checks.
*   **No feature without tests:** Code without accompanying tests (unit/integration) will not be accepted.
*   **No page without comprehensive states:** Every page and complex component must explicitly handle and display: Loading, Empty, Success, and Error states.
*   **No server action without audit logging:** Any mutation (create, update, delete) must generate a standardized audit log entry.

---

## 3. UI Rules

Visual consistency is paramount. All UI elements must adhere to the central design system.

*   **Layouts:** Use predefined page and section layouts. Do not construct ad-hoc page structures.
*   **Spacing:** Use the standardized spacing scale (e.g., specific rem values or Tailwind spacing classes). No arbitrary margin/padding values.
*   **Typography:** Use the standardized font scale, weights, and line heights.
*   **Cards:** Use the standard Card component for all grouped content.
*   **Dialogs / Drawers:** Use central components for all modals and flyouts. Must trap focus and support Esc key closure.
*   **Tables:** Use the standard data table component, implementing consistent pagination, sorting, and filtering.
*   **Forms:** Form structures, input fields, labels, and error messages must use standard components.
*   **Badges / Buttons / Toasts / Skeletons:** Must use the design system's variants. No custom styling of these primitive elements.
*   **Accessibility (a11y):** All interactive elements must have appropriate ARIA attributes, semantic HTML, and keyboard navigability.
*   **Dark Mode:** All UI components must explicitly support and test both light and dark modes.
*   **Responsive Behavior:** Mobile-first design is mandatory. Components must degrade gracefully on smaller screens.
*   **Keyboard Shortcuts:** Core actions should be accessible via standardized keyboard shortcuts where applicable.

---

## 4. Data Rules

Standardize the handling of all data entities:

*   **Entity Lifecycle:** Standardize creation (UUIDs, timestamps), updates, and deletion workflows.
*   **Soft Delete:** By default, records are soft-deleted (using a `deleted_at` timestamp). Hard deletes require explicit architectural approval.
*   **Archive:** Implement standard archival mechanisms for inactive data to maintain performance.
*   **Versioning:** Critical entities must support versioning to track historical states.
*   **Undo / Restore:** Implement undo mechanisms for destructive actions where feasible; support restoring soft-deleted records.
*   **Audit & Activity:** All state changes must be recorded in an immutable audit log, tied to the acting user/tenant.
*   **Optimistic Locking:** Use version numbers or timestamps to prevent concurrent update conflicts.
*   **Bulk Actions:** All list views must support bulk operations (select all, apply to selected) using optimized backend endpoints.
*   **Imports / Exports:** Standardize CSV/Excel import validation and asynchronous export generation.

---

## 5. API Rules

All APIs (REST or GraphQL) must adhere to these standards:

*   **Naming:** Resource-oriented, plural nouns, kebab-case (e.g., `/api/v1/user-profiles`).
*   **Versioning:** All endpoints must be explicitly versioned (e.g., `/v1/`).
*   **Error Format:** Standardized JSON error response: `{ error: { code, message, details[] } }`.
*   **Validation:** All incoming payloads must be validated against a strict schema before processing.
*   **Authentication:** All endpoints (unless explicitly public) must require a valid authentication token.
*   **Authorization:** All endpoints must verify the authenticated user has the specific permissions required for the resource and action.
*   **Idempotency:** All state-mutating requests (POST, PUT, PATCH, DELETE) should support idempotency keys to safely retry failed requests.
*   **Pagination:** All collection endpoints must use cursor-based or keyset pagination. Limit standard page sizes.
*   **Filtering & Sorting:** Implement standardized query parameters for filtering (e.g., `?filter[status]=active`) and sorting (e.g., `?sort=-created_at`).

---

## 6. Security Rules

Security is non-negotiable and must be built-in, not bolted on.

*   **Tenant Isolation:** In multi-tenant environments, every query and mutation MUST explicitly scope to the current `tenant_id`.
*   **RBAC (Role-Based Access Control):** Permissions are granted via roles. Code must check permissions (e.g., `can('edit:users')`), never specific roles.
*   **Input Validation:** Never trust client data. Validate all input strictly on the server.
*   **Output Filtering:** Ensure API responses do not leak sensitive or unnecessary fields. Use DTOs (Data Transfer Objects).
*   **Rate Limiting:** Protect all public and authenticated endpoints against abuse using tiered rate limiting.
*   **Secrets:** Never hardcode secrets. Use environment variables and secure secret management systems.
*   **Webhooks:** All outgoing webhooks must be signed; all incoming webhooks must verify signatures.
*   **File Access:** Files must be stored securely. Access to private files requires signed URLs or proxy validation.
*   **Logging & Audit:** Log all security-relevant events (logins, permission changes, data access). Ensure logs do not contain PII or secrets.

---

## 7. Code Quality Rules

Maintain a pristine, predictable codebase.

*   **Folder Structure:** Strictly adhere to the architecture guide's defined directory layout. No arbitrary folders.
*   **Naming Conventions:**
    *   Variables/Functions: `camelCase`
    *   Classes/Components: `PascalCase`
    *   Files/Directories: `kebab-case`
    *   Constants: `UPPER_SNAKE_CASE`
*   **Function Size:** Keep functions small and focused on a single responsibility.
*   **Component Size:** Break large components into smaller, reusable sub-components.
*   **Maximum Nesting:** Avoid deep nesting (e.g., > 3 levels of indentation). Extract logic early.
*   **Reusable Hooks:** Extract complex React logic (state, effects) into custom hooks.
*   **Reusable Utilities:** Place pure functions used across multiple files into shared utility modules.
*   **Dependency Rules:** Adhere to dependency directions (e.g., UI depends on Domain, Domain depends on nothing).

---

## 8. Testing Rules

*   **Unit Tests:** Must cover all utilities, hooks, state machines, and complex business logic.
*   **Integration Tests:** Must cover API endpoints, database interactions (using test DBs), and repository layers.
*   **E2E (End-to-End) Tests:** Must cover critical user journeys (e.g., login, checkout, core CRUD).
*   **Performance Tests:** Ensure critical endpoints respond within SLA under load.
*   **Security Tests:** Automated scanning for vulnerabilities, outdated dependencies, and static analysis (SAST).
*   **Regression Tests:** Any fixed bug must be accompanied by a test that would have caught it.
*   **Coverage Requirements:** Minimum 80% code coverage required for all new PRs.

---

## 9. Documentation Rules

Code is read more often than written. Documentation must stay current.

Whenever an implementation changes the architecture or core behavior:

1.  **Update AKB:** Modify the Architecture Knowledge Base if a pattern changes.
2.  **Update ADR:** Write an Architecture Decision Record for the change.
3.  **Update PRD if needed:** Sync with Product if technical constraints altered requirements.
4.  **Update MDP progress:** Reflect the completion of the work.
5.  **Document Migration:** Clearly document steps required to migrate existing data or state.
6.  **Record Breaking Changes:** Explicitly log breaking changes in the `changelog.md` and notify dependents.

---

## 10. AI Development Rules

Strict rules governing the use of AI coding assistants within this project.

**The AI MUST NEVER:**
*   **Invent folders:** Stick to the existing `EAIG` structure.
*   **Invent tables:** Schema changes require explicit human approval and migrations.
*   **Invent APIs:** Endpoint definitions must follow the AKB.
*   **Change architecture:** Do not introduce new frameworks, state management libraries, or core patterns without instruction.
*   **Skip security:** Do not omit input validation, authorization checks, or audit logs.
*   **Ignore tenant isolation:** Never write a query that forgets the `tenant_id` clause.
*   **Ignore lifecycle rules:** Do not perform hard deletes or skip timestamp updates.

**The AI MUST ALWAYS:**
*   **Explain tradeoffs:** Before recommending an architectural change, the AI must explain the pros, cons, and alternatives to the user.
*   **Check existing patterns:** Look for existing utilities or components before generating new ones.

---

## 11. Definition of Production Ready

A feature is strictly prohibited from being merged into the production branch unless it meets **ALL** of the following criteria:

*   [ ] **Code Reviewed:** Approved by at least one senior engineer.
*   [ ] **Tests Passing:** Unit, integration, and E2E test suites pass successfully. Coverage requirements met.
*   [ ] **Linting & Formatting:** No linting errors or formatting warnings.
*   [ ] **Security Checked:** No SAST/DAST violations. Secrets are properly managed. RBAC/Tenant isolation verified.
*   [ ] **Performance Validated:** N+1 queries eliminated. Payload sizes optimized.
*   [ ] **UI/UX Approved:** Matches Figma designs. Responsive on all target devices. Dark mode verified. All UI states (loading, error, etc.) implemented.
*   [ ] **Accessibility Verified:** Passes automated a11y checks. Keyboard navigable.
*   [ ] **Documentation Updated:** AKB, TDD, and API specs reflect the final implementation.
*   [ ] **Observability Added:** Audit logging, error tracking (e.g., Sentry), and necessary metrics are implemented.
*   [ ] **Migration Tested:** Database migrations have been tested against a staging environment (both up and down).
*   [ ] **Product Sign-off:** The Product Owner has verified the feature meets the PRD.
