import { DomainEvent } from "@/modules/core/events";
import { financeService } from "./services";

export async function handleFinanceEvent(event: DomainEvent) {
  switch (event.type) {
    case "ProposalAccepted":
      // Handled primarily by the Conversion Engine (Orchestration).
      // If Finance has internal decoupled side-effects, they go here.
      break;

    case "ProjectCreated":
      // Example: Finance might need to know when a project formally enters the execution phase
      // to update retainer allocations.
      break;

    case "InvoicePaid":
      // Internal finance reaction to Invoice Paid (e.g. updating aggregated revenue metrics, sending receipts)
      break;

    case "PaymentVerified":
      // Internal finance reaction to Payment Verified
      break;

    default:
      break;
  }
}
