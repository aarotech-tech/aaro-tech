# Event Ownership Matrix: Sales Bounded Context

This matrix acts as the formal contract between the Sales bounded context and all downstream systems (Delivery, Finance, Notifications, etc.).

| Event Name | Publisher | Subscribers | Side Effects | Transaction Boundary | Retry Behaviour | Failure Behaviour |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `LeadQualified` | Sales (`qualifyLead` Service) | None | Creates initial `Deal` within Sales domain. | Bound to Qualification Request | Immediate failure (synchronous) | Returns error to user; Lead remains unqualified. |
| `ProposalAccepted` | Sales (`approveProposal` Service) | Conversion Engine (System) | Triggers the Conversion Engine to mint a `Project` (Delivery) and an initial `Invoice` (Finance). | Bound to Proposal Approval Request | Exponential Backoff (if async/queue based) | Conversion Engine halts; alerts Admin; Proposal remains accepted. |

## The Authoritative Conversion Trigger

The **ONLY** authoritative business event for project creation and commercial onboarding is `ProposalAccepted`. 

*   `DealWon` is strictly a CRM UI pipeline stage. Moving a Deal to "Won" does **not** trigger the Conversion Engine. 
*   A Deal is only truly commercially won when the Client executes a Proposal, which emits `ProposalAccepted`.
*   The Conversion Engine subscribes exclusively to `ProposalAccepted`.
