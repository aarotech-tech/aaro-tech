import { logActivity } from "./activity";
import { notificationService } from "./notifications";

// Domain Events Definitions
export type DomainEvent =
  | { type: "DealCreated"; payload: { organizationId: string; dealId: string; dealName: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "ProposalSent"; payload: { organizationId: string; proposalId: string; clientEmail: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "ProposalAccepted"; payload: { organizationId: string; proposalId: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "InvoiceCreated"; payload: { organizationId: string; invoiceId: string; amount: number; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "PaymentRecorded"; payload: { organizationId: string; invoiceId: string; amount: number; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "ProjectCreated"; payload: { organizationId: string; projectId: string; projectName: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "DeliverableUploaded"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "DeliverableApproved"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "RevisionRequested"; payload: { organizationId: string; projectId: string; deliverableId: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } }
  | { type: "ClientInvited"; payload: { organizationId: string; email: string; userId?: string; ipAddress?: string; userAgent?: string; previousValue?: any; newValue?: any } };

/**
 * emitDomainEvent acts as a lightweight internal Event Bus.
 * It is completely non-blocking, returning immediately so the parent request isn't blocked.
 * It handles the cross-cutting concerns: Activity Logging & Notifications.
 */
export function emitDomainEvent(event: DomainEvent) {
  // Fire and forget asynchronous execution
  Promise.resolve().then(async () => {
    try {
      await processEvent(event);
    } catch (e) {
      console.error(`Failed to process domain event ${event.type}:`, e);
      // In a production system, this could log to Sentry or a Dead Letter Queue
    }
  });
}

export const eventBus = {
  emit: emitDomainEvent
};

async function processEvent(event: DomainEvent) {
  // 1. Log Activity for every event
  let entityType = "";
  let entityId = "";
  let actionStr = event.type;
  
  switch (event.type) {
    case "DealCreated":
      entityType = "deal";
      entityId = event.payload.dealId;
      break;
    case "ProposalSent":
    case "ProposalAccepted":
      entityType = "proposal";
      entityId = event.payload.proposalId;
      break;
    case "InvoiceCreated":
    case "PaymentRecorded":
      entityType = "invoice";
      entityId = event.payload.invoiceId;
      break;
    case "ProjectCreated":
      entityType = "project";
      entityId = event.payload.projectId;
      break;
    case "DeliverableUploaded":
    case "DeliverableApproved":
    case "RevisionRequested":
      entityType = "deliverable";
      entityId = event.payload.deliverableId;
      break;
    case "ClientInvited":
      entityType = "organization";
      entityId = event.payload.organizationId;
      break;
  }

  await logActivity({
    organizationId: event.payload.organizationId,
    userId: event.payload.userId,
    action: actionStr,
    entityType,
    entityId,
    ipAddress: event.payload.ipAddress,
    userAgent: event.payload.userAgent,
    previousValue: event.payload.previousValue,
    newValue: event.payload.newValue,
    metadata: event.payload,
  });

  // 2. Trigger asynchronous side-effects (Emails / Notifications)
  // We can load React Email templates dynamically here based on the event type
  // For now we will mock the email abstractions
  switch (event.type) {
    case "ProposalAccepted":
      await notificationService.sendInAppNotification({
        userId: "internal_team",
        message: "A proposal was accepted! Time to set up the project.",
      });
      break;
      
    case "PaymentRecorded":
      await notificationService.sendInAppNotification({
        userId: "finance_team",
        message: `Payment of $${(event.payload.amount / 100).toLocaleString()} recorded for invoice ${event.payload.invoiceId}.`,
      });
      break;
      
    case "DeliverableApproved":
      await notificationService.sendInAppNotification({
        userId: "delivery_team",
        message: `Deliverable ${event.payload.deliverableId} was approved!`,
      });
      break;
  }
}
