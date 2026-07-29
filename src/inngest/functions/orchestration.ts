import { inngest } from "../client";
import { createProjectFromDeal } from "@/modules/delivery/services";
import { notificationService } from "@/modules/core/notifications";
import { conversionEngine } from "@/modules/orchestration/conversion-engine";
import { NonRetriableError } from "inngest";
import { DomainStateTransitionError } from "@/modules/core/errors";
import { z } from "zod";

const ProposalAcceptedSchema = z.object({
  organizationId: z.string().min(1),
  dealId: z.string().min(1),
  proposalId: z.string().min(1)
});

const InvoicePaidSchema = z.object({
  organizationId: z.string().min(1),
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  provider: z.string().min(1)
});

// Mocking orchestration flow for Epic 7 validation.
export const handleDealWon = inngest.createFunction(
  { id: "handle-deal-won", triggers: [{ event: "Domain/DealWon" }] },
  async ({ event, step }) => {
    // This is the core orchestration logic
    const { organizationId, dealId, dealName } = event.data;
    
    // 1. Create a Project via orchestration
    const project = await step.run("create-project-from-deal", async () => {
      return await createProjectFromDeal(dealId, `Project: ${dealName || "New Implementation"}`);
    });

    // 2. Schedule notifications
    await step.run("notify-delivery-team", async () => {
      await notificationService.sendInAppNotification({
        recipient: "delivery_team",
        organizationId,
        message: `A new project "${project.name}" has been created from a Won Deal.`,
        entityType: "project",
        entityId: project.id
      });
    });

    return { project };
  }
);

export const handleProposalAccepted = inngest.createFunction(
  { id: "handle-proposal-accepted", retries: 3, triggers: [{ event: "Domain/ProposalAccepted" }] },
  async (ctx: any) => {
    const { event, step } = ctx;
    const parseResult = ProposalAcceptedSchema.safeParse(event.data);
    if (!parseResult.success) {
      throw new NonRetriableError(`Invalid payload for ProposalAccepted: ${parseResult.error.message}`);
    }
    
    const { dealId, organizationId, proposalId } = parseResult.data;
    console.log(JSON.stringify({
      message: "Handling ProposalAccepted",
      eventId: event.id,
      organizationId,
      dealId,
      proposalId
    }));

    const result = await step.run("conversion-engine-proposal-accepted", async () => {
      try {
        return await conversionEngine.handleProposalAccepted(dealId, organizationId);
      } catch (err: any) {
        if (err instanceof DomainStateTransitionError) {
          throw new NonRetriableError(`Idempotent skip: ${err.message}`);
        }
        throw err;
      }
    });

    if (result.skipped) {
      console.log(JSON.stringify({
        message: "ProposalAccepted skipped (already processed)",
        eventId: event.id,
        organizationId,
        dealId,
        projectId: result.project?.id
      }));
    } else {
      console.log(JSON.stringify({
        message: "Project successfully created",
        eventId: event.id,
        organizationId,
        dealId,
        projectId: result.project?.id
      }));
    }

    return result;
  }
);

export const handleInvoicePaid = inngest.createFunction(
  { id: "handle-invoice-paid", retries: 3, triggers: [{ event: "Domain/InvoicePaid" }] },
  async (ctx: any) => {
    const { event, step } = ctx;
    const parseResult = InvoicePaidSchema.safeParse(event.data);
    if (!parseResult.success) {
      throw new NonRetriableError(`Invalid payload for InvoicePaid: ${parseResult.error.message}`);
    }
    
    const { invoiceId, organizationId, amount } = parseResult.data;
    console.log(JSON.stringify({
      message: "Handling InvoicePaid",
      eventId: event.id,
      organizationId,
      invoiceId,
      amount
    }));

    const result = await step.run("conversion-engine-invoice-paid", async () => {
      try {
        return await conversionEngine.handleInvoicePaid(invoiceId, organizationId);
      } catch (err: any) {
        if (err instanceof DomainStateTransitionError) {
          throw new NonRetriableError(`Idempotent skip: ${err.message}`);
        }
        throw err;
      }
    });

    console.log(JSON.stringify({
      message: "Project successfully activated or skipped",
      eventId: event.id,
      organizationId,
      invoiceId,
      projectId: result?.id
    }));

    return result;
  }
);
