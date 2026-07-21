# Aarotech Enterprise Platform — Data Operations & Entity Lifecycle Specification

**Role:** Principal Product Architect / Data Governance Architect  
**Status:** Final Product Specification

This document defines the operational behavior, lifecycle, state transitions, and audit requirements for every business entity in the Aarotech platform. It serves as the definitive guide to moving beyond basic CRUD operations to an enterprise-grade data architecture.

---

## SECTION 1: Enterprise Data Philosophy

**Why CRUD is Insufficient**
Basic Create, Read, Update, Delete (CRUD) operations map directly to a database, not to human intent. Enterprise software models real-world business actions. When a user "Updates" an invoice, they might actually be "Voiding" it. When they "Delete" a project, they might be "Archiving" it. An enterprise system captures *intent*, ensures compliance, and preserves history.

**Operation Definitions**
- **Create:** Instantiate a new record.
- **Update/Edit:** Modify mutable fields on an active record.
- **Delete:** Remove a record from the database entirely (Hard Delete). *Rarely allowed.*
- **Soft Delete:** Mark a record as `deleted_at` so it disappears from standard queries but remains in the DB.
- **Archive:** Move a record out of the active operational view (e.g., a finished project) while keeping it fully accessible and non-deleted.
- **Restore:** Bring a Soft Deleted or Archived record back to Active status.
- **Duplicate/Clone:** Create a new record using an existing record as a template.
- **Merge:** Combine two distinct records (e.g., Contacts) into a single surviving record.
- **Convert:** Transform one entity type into another (e.g., Lead -> Deal).
- **Undo/Redo:** Client-side or transient reversal of recent actions.
- **Rollback / Version Restore:** Revert an entity to a historically saved state.
- **Publish / Unpublish:** Toggle visibility for external actors (Clients).
- **Lock / Unlock:** Prevent modifications due to business rules (e.g., an Approved Proposal is Locked).
- **Void / Cancel:** Terminate a financial or legal record without deleting it (it must remain for audits).
- **Deactivate:** Suspend a User or Organization's access without deleting their history.

**Immutable vs. Legal vs. Audit Records**
- *Financial/Legal Records* (Invoices, Signed Proposals, Payments) are strictly **Immutable** once executed. They can only be Voided or Refunded, never Edited or Deleted.
- *Audit Records* are append-only. They are never deleted under any circumstance.

---

## SECTION 2: Global Data Lifecycle Standards

All non-immutable entities follow a standard operational lifecycle:

**Draft -> Active -> Archived -> Soft Deleted -> Permanent Delete**

1. **Draft:** Record is being formulated. Invisible to downstream workflows and clients.
2. **Active:** Record is operational.
3. **Archived:** Record reached its natural end of life (e.g., Project Completed). Read-only by default.
4. **Soft Deleted:** Record was "deleted" by a user. Hidden from all views except "Trash". Automatically hard deleted after 30 days.
5. **Permanent Delete:** Record is purged from the database. Allowed only by System Admins for compliance (GDPR).

---

## SECTION 3: Entity Operations Matrix

*(Sample of critical entities. This matrix applies universally.)*

### 1. Proposal
- **Purpose:** Contractual agreement.
- **Owner:** Sales.
- **Lifecycle:** Draft -> Sent -> Accepted / Rejected -> Expired.
- **Supported Operations:** Create, Edit (only in Draft), Duplicate, Send, Void, Export (PDF).
- **Unsupported:** Delete (once sent), Edit (once sent).

### 2. Deliverable
- **Purpose:** Client review item.
- **Owner:** Delivery.
- **Lifecycle:** Draft -> Awaiting Review -> Changes Requested / Approved.
- **Supported Operations:** Create, Edit, Upload Version, Comment, Approve, Reject, Share, Archive.
- **Unsupported:** Delete (if Approved).

### 3. Invoice
- **Purpose:** Revenue collection.
- **Owner:** Finance.
- **Lifecycle:** Draft -> Open -> Paid / Void.
- **Supported Operations:** Create, Send, Pay, Void, Export.
- **Unsupported:** Delete, Edit (once Open).

### 4. Project
- **Purpose:** Execution container.
- **Owner:** Delivery.
- **Lifecycle:** Pending -> Active -> Completed -> Archived.
- **Supported Operations:** Create, Edit, Archive, Unarchive, Duplicate.
- **Quick Actions:** Create Task, Log Activity.

---

## SECTION 4: CRUD++ (Enterprise Operations)

Every entity must support a strict subset of extended operations. 

**Example: The "Merge" Operation (Contacts)**
- **Purpose:** Deduplicate two contacts representing the same person.
- **Permissions:** Admin / Sales Manager.
- **Validation:** Must belong to the same Organization.
- **Side Effects:** Re-parents all Deals, Projects, and Comments from Contact B to Contact A.
- **Audit Entries:** Contact A receives `merged_with` audit log. Contact B is Soft Deleted.
- **Notifications:** None.

**Example: The "Lock" Operation (Proposal)**
- **Purpose:** Prevent tampering of a sent contract.
- **Permissions:** System invoked (on 'Send' action).
- **Validation:** Must be in 'Draft' state prior to sending.
- **Side Effects:** Disables all `update` mutations on the entity.

---

## SECTION 5: Undo / Redo Framework

- **What can be undone:** Destructive but non-notifying actions (e.g., Soft Deleting a Task, moving a Kanban card).
- **What cannot be undone:** Actions triggering external side effects (e.g., Sending an Email, Processing a Stripe Payment, Approving a Deliverable).
- **Timeout:** The standard global Undo window is **10 seconds**.
- **Optimistic Updates:** The UI reflects the change immediately and shows a toast with an "Undo" button. If clicked, a rollback mutation is fired. If the timeout expires, the action is permanent (requiring manual reversion if supported).

---

## SECTION 6: Versioning Framework

Versioning guarantees that historical context is never lost for collaborative entities.

**Deliverable Versions:**
- **Create Version:** Uploading a new file to an existing Deliverable auto-increments the version (v1, v2).
- **Compare Versions:** UI allows side-by-side visual diffing or switching between v1 and v2.
- **Current Version:** The active file presented to the client.
- **Version Lock:** Once a version is 'Approved', it is locked. Further changes require a new Deliverable.

**Proposal Versions:**
- If a client requests changes to a proposal, the original is marked `Void` and a new version `v2` is generated. We do not edit sent proposals.

---

## SECTION 7: Rollback & Recovery

- **Undo:** Transient client-side action (e.g., moving a task).
- **Rollback:** Reverting a field to a historical state via the Audit Trail (e.g., restoring a deleted paragraph in a Knowledge Base article).
- **Restore (Recovery):** Bringing a Soft Deleted entity back from the Trash.
- **Reopen / Revert Status:** Moving a terminal state backwards (e.g., Project from 'Completed' back to 'Active').

**Entity Rules:**
- **Invoices:** Cannot Undo. Cannot Edit. Can only Void.
- **Tasks:** Can Undo (within 10s). Can Soft Delete. Can Restore. Can Reopen.
- **Projects:** Can Archive. Can Restore. Can Reopen.

---

## SECTION 8: Activity Timeline

Every action produces an Activity record.

- **Schema:** `id`, `entity_type`, `entity_id`, `actor_id`, `action_type`, `metadata` (JSON), `created_at`.
- **System Events:** "Status changed to Active by System Workflow."
- **Human Events:** "Aaron added a comment."
- **Timeline Grouping:** Consecutive actions by the same user within 5 minutes on the same entity are grouped visually in the UI.
- **Retention:** Activity logs are retained forever.

---

## SECTION 9: Audit Trail

Audit Trails are distinct from Activity Timelines. Activity is for UX; Audit is for compliance.

- **Immutable:** Audit logs are strictly insert-only at the database level.
- **Capture:** Who (User ID), What (Mutation Name), When (Timestamp), Previous Value (JSON), New Value (JSON), IP Address, User Agent, Correlation ID.
- **Visibility:** Only System Admins can view raw Audit logs.

---

## SECTION 10: Bulk Operations

Enterprise tools require mass data manipulation.

- **Supported Operations:** Bulk Edit, Bulk Delete (Soft), Bulk Assign, Bulk Archive.
- **UI:** Select multiple rows in a table -> floating action bar appears.
- **Conflict Handling:** If a bulk action attempts to modify an invalid record (e.g., Bulk Archive includes an already archived project), skip the invalid record, process the rest, and show a partial success summary dialog.
- **Progress:** Long-running bulk operations (>50 records) execute asynchronously via Trigger.dev and display a progress toast.

---

## SECTION 11: Import & Export

- **CSV/Excel Export:** Available on every list view. Exports exactly what is currently filtered/visible.
- **PDF Export:** Available for Proposals and Invoices.
- **Import:** Lead and Contact import wizard.
  - **Validation:** Dry-run validation phase before database insertion.
  - **Mapping UI:** Visual interface to map CSV columns to database fields.
  - **Duplicate Detection:** Automatic fuzzy matching on emails/names.

---

## SECTION 12: Entity Locking & Concurrency

- **Optimistic Locking:** Every update mutation requires passing the `updated_at` timestamp. If the DB `updated_at` differs from the client's payload, the mutation fails with a "Conflict Error" (HTTP 409) preventing users from overwriting each other's work.
- **Record Locking:** Financial entities are hard-locked at the DB level once finalized.
- **Presence Indicators:** (Future Phase) Display avatars of other users currently viewing the same Project or Proposal.

---

## SECTION 13: Destructive Actions

- **Confirmation Dialog:** Any action resulting in a state change that hides data (Archive, Soft Delete) requires a standard confirmation dialog.
- **Danger Level:** "Permanent Delete" requires the user to type the name of the entity (e.g., "Type 'ACME CORP' to confirm deletion").
- **Dependencies:** Attempting to delete an Organization with active Projects will fail with a warning dialog detailing the blocking dependencies.

---

## SECTION 14: Cross-Entity Actions (The Lead Conversion Workflow)

**Workflow:** Lead -> Deal -> Proposal -> Project -> Invoice.
- **Conversion:** When a Proposal is Signed:
  1. Idempotency key generated.
  2. Deal updated to 'Won'.
  3. New Project instantiated with Organization ID.
  4. First Invoice generated (if deposit required).
- **Failure Recovery:** If the Project creation fails, the Deal is NOT rolled back. Instead, a dead-letter queue catches the failure, and an Admin is alerted to manually trigger the Project creation.

---

## SECTION 15: UX Standards for Data Operations

- **Loading:** Every mutation triggers a localized loading spinner (button level, not page level).
- **Optimistic UI:** Checkboxes and Kanban drags update instantly. Errors revert the UI and show a toast.
- **Success:** Green toast notification.
- **Failure:** Red toast notification with actionable error message (e.g., "Cannot delete project because it has unpaid invoices").

---

## SECTION 16: Mandatory Developer Rules

1. **Never hard delete financial or legal records.**
2. **Every mutation must use the `withActionErrorHandling()` wrapper.**
3. **Every state transition must be validated server-side** (never trust the client).
4. **No direct DB writes from Client Components.**
5. **No business logic duplication.** All state transitions must live in domain service functions, not scattered in route handlers.

---

## SECTION 17: Definition of Done (Entity Readiness)

An entity is considered fully enterprise-ready when it possesses:
- [x] Defined Lifecycle (Draft -> Active -> Archived)
- [x] CRUD++ Operations implemented in Server Actions
- [x] Activity Timeline integration
- [x] Audit Trail generation on all mutations
- [x] Bulk Operation support in UI tables
- [x] Standardized Error / Success / Loading states
- [x] Complete test coverage for state transitions
