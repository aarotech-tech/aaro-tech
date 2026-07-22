import { logActivity } from "./activity";
import { notificationService } from "./notifications";
import { conversionEngine } from "@/modules/orchestration/conversion-engine";

// Domain Events Definitions
export type DomainEvent =
  | { type: "WebsiteLeadCreated"; payload: { organizationId: string; name: string; email: string } }
  | { type: "LeadQualified"; payload: { organizationId: string; leadId: string; dealId: string; userId?: string } }
  | { type: "DealCreated"; payload: { organizationId: string; dealId: string; dealName: string; userId?: string } }
  | { type: "DealStageChanged"; payload: { organizationId: string; dealId: string; stage: string; userId?: string } }
  | { type: "DealWon"; payload: { organizationId: string; dealId: string; dealName: string; userId?: string } }
  | { type: "ProposalCreated"; payload: { organizationId: string; proposalId: string; dealId: string; userId?: string } }
  | { type: "ProposalSent"; payload: { organizationId: string; proposalId: string; clientEmail: string; userId?: string } }
  | { type: "ProposalAccepted"; payload: { organizationId: string; proposalId: string; dealId: string; userId?: string } }
  | { type: "ProjectCreated"; payload: { organizationId: string; projectId: string; projectName: string; userId?: string } }
  | { type: "ProjectActivated"; payload: { organizationId: string; projectId: string; userId?: string } }
  | { type: "TaskAssigned"; payload: { organizationId: string; projectId: string; taskId: string; assigneeId: string; userId?: string } }
  | { type: "DeliverableSubmitted"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string } }
  | { type: "DeliverableApproved"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string } }
  | { type: "DeliverableRejected"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string } }
  | { type: "InvoiceCreated"; payload: { organizationId: string; invoiceId: string; amount: number; userId?: string } }
  | { type: "InvoiceSent"; payload: { organizationId: string; invoiceId: string; amount: number; userId?: string } }
  | { type: "InvoiceViewed"; payload: { organizationId: string; invoiceId: string; userId?: string } }
  | { type: "InvoicePaid"; payload: { organizationId: string; invoiceId: string; amount: number; provider: string; userId?: string } }
  | { type: "PaymentVerified"; payload: { organizationId: string; paymentId: string; amount: number; userId?: string } }
  | { type: "ClientInvited"; payload: { organizationId: string; email: string; userId?: string } }
  | { type: "ClientJoinedPortal"; payload: { organizationId: string; userId: string } };

import { inngest } from "@/inngest/client";

/**
 * emitDomainEvent acts as the central event router.
 * It immediately pushes the event to the Inngest background processor.
 */
export async function emitDomainEvent(event: DomainEvent) {
  try {
    // Send event to Inngest to be processed asynchronously
    await inngest.send({
      name: `Domain/${event.type}` as any, // prefixing with Domain/ to group them
      data: event.payload,
    });
    console.log(`[Event Bus] Dispatched ${event.type} to Inngest`);
  } catch (e) {
    console.error(`Failed to dispatch event ${event.type} to Inngest:`, e);
  }
  
  // Local Development Fallback: If Inngest is not running, process it locally
  if (process.env.NODE_ENV === 'development' || !process.env.INNGEST_EVENT_KEY) {
    if (event.type === 'ProposalAccepted') {
      console.log(`[Event Bus Fallback] Processing ${event.type} locally...`);
      await conversionEngine.handleProposalAccepted(event.payload.dealId, event.payload.organizationId);
    }
  }
}

export const eventBus = {
  emit: emitDomainEvent
};

