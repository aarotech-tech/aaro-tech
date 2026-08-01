import { logActivity } from "./activity";
import { notificationService } from "./notifications";
import { conversionEngine } from "@/modules/orchestration/conversion-engine";
import { eq } from "drizzle-orm";

// Domain Events Definitions
export type DomainEvent =
  | { type: "WebsiteLeadCreated"; payload: { organizationId: string; name: string; email: string; phone?: string | null; businessName?: string | null; websiteUrl?: string | null; challenge?: string | null } }
  | { type: "LeadQualified"; payload: { organizationId: string; leadId: string; dealId: string; userId?: string } }
  | { type: "DealCreated"; payload: { organizationId: string; dealId: string; dealName: string; userId?: string } }
  | { type: "DealStageChanged"; payload: { organizationId: string; dealId: string; stage: string; userId?: string } }
  | { type: "DealWon"; payload: { organizationId: string; dealId: string; dealName: string; userId?: string } }
  | { type: "ProposalCreated"; payload: { organizationId: string; proposalId: string; dealId: string; userId?: string } }
  | { type: "ProposalSent"; payload: { organizationId: string; proposalId: string; clientEmail: string; userId?: string } }
  | { type: "ProposalAccepted"; payload: { organizationId: string; proposalId: string; dealId: string; userId?: string } }
  | { type: "ProjectCreated"; payload: { organizationId: string; projectId: string; projectName: string; userId?: string } }
  | { type: "ProjectActivated"; payload: { organizationId: string; projectId: string; userId?: string } }
  | { type: "ProjectCompleted"; payload: { organizationId: string; projectId: string; userId?: string } }
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

import { db } from "@/db";
import { outboxEvents } from "@/db/schema";

/**
 * emitDomainEvent acts as the central event router.
 * It strictly persists the event to the outbox_events table.
 * A dedicated publisher worker will process the outbox asynchronously.
 */
export async function emitDomainEvent(event: DomainEvent, tx?: any) {
  const dbClient = tx || db;

  try {
    await dbClient.insert(outboxEvents).values({
      type: `Domain/${event.type}`,
      payload: event.payload,
      status: "pending",
    });
    console.log(`[Event Bus] Persisted ${event.type} to Outbox`);
  } catch (e) {
    console.error(`[Event Bus] Failed to persist event ${event.type} to Outbox:`, e);
    throw e; // Strict failure: never silently drop an event
  }
  
  // Local Development Fallback: If Inngest is not running or we want instant feedback, process it locally
  // [DEV-ONLY] This is retained strictly for local developer convenience. 
  // It must never mask the requirement for proper Inngest handlers in production.
  if (process.env.NODE_ENV === 'development' || !process.env.INNGEST_EVENT_KEY) {
    console.log(`[Event Bus Fallback] [DEV-ONLY] Instantly dispatching ${event.type} to Inngest...`);
    try {
      await inngest.send({
        name: `Domain/${event.type}` as any,
        data: event.payload,
      });
      
      // Mark as processed in local dev so it doesn't pile up
      await dbClient.update(outboxEvents)
        .set({ status: 'processed', processedAt: new Date() })
        .where(eq(outboxEvents.type, `Domain/${event.type}`));
    } catch (err) {
      console.error(`[Event Bus Fallback] Failed to dispatch ${event.type}:`, err);
    }

    if (event.type === 'ProposalAccepted') {
      console.log(`[Event Bus Fallback] [DEV-ONLY] Processing ${event.type} locally without Inngest...`);
      await conversionEngine.handleProposalAccepted(event.payload.dealId, event.payload.organizationId);
    }
  }
}

export const eventBus = {
  emit: emitDomainEvent
};

