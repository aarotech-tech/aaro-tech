# Engineering Execution Backlog v2 (Product Rebuild Phase)

This backlog focuses entirely on aligning the current implementation with the Master Product Specification. **No net-new features will be built** until these gaps are closed. This backlog is strictly ordered by dependency.

## Epic 1: Platform Foundation (Completed)
*Establish the AdminShell and dismantle the monolithic CRM routing.*

## Epic 2: Sales Workspace (Completed)
*Establish Sales as the first bounded context (Leads, Deals, Proposals).*

## Epic 3: Delivery Workspace & Orchestration (Completed)
*Establish pure Event-Driven orchestration and the Delivery bounded context (Projects, Tasks, Reviews).*

## Epic 4: Finance Workspace
*Establish the Finance bounded context.*
*   **TSK-V2-401:** Implement `src/modules/finance/services.ts` enforcing strict Invoice and Payment lifecycles.
*   **TSK-V2-402:** Prevent Finance from querying Sales or Delivery repositories directly. Ensure it consumes orchestration events only.
*   **TSK-V2-403:** Expose reusable financial read models and dashboard metrics.

## Epic 5: Executive Dashboard, Inbox, Navigation & Workspace Activation
*Build the operational views.*
*   **TSK-V2-501:** Build Executive Dashboard consuming metrics from Sales, Delivery, and Finance.
*   **TSK-V2-502:** Build `/inbox` for notification consumption.

## Epic 6: Client Portal Rebuild
*Rebuild the Client Portal as a presentation layer consuming domain services.*
*   **TSK-V2-601:** Build `/portal/home`, `/portal/projects`, `/portal/reviews`, `/portal/billing`, `/portal/documents`, and `/portal/settings`.
*   **TSK-V2-602:** Ensure the Portal contains no direct DB mutations or business logic.

## Epic 7: Automation & Notifications
*Formalize event-driven side effects.*
*   **TSK-V2-701:** Ensure all workflow events route to real user identities.

## Epic 8: UX Standardization, Hardening & Production Readiness
*Platform-wide polish.*
*   **TSK-V2-801:** Standardize DataTables, Loading States, and Empty States globally.
