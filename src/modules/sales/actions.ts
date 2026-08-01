"use server";

import { z } from "zod";
import { internalActionClient, actionClient } from "@/lib/safe-action";
import * as SalesService from "./services";
import { revalidatePath } from "next/cache";
import { contactFormSchema } from "@/lib/validations/contact";

/**
 * Qualifies a lead. Requires internal agency access.
 */
const qualifyLeadSchema = z.object({
  leadId: z.string().uuid("Invalid Lead ID"),
});

const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid("Invalid Lead ID"),
  status: z.enum(["new", "contacted", "qualified", "archived"]),
});

export const updateLeadStatusAction = internalActionClient
  .schema(updateLeadStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const SalesRepo = await import("./repositories");
    const { withUndoTracking } = await import("@/modules/core/undo");
    
    const { result, actionLogId } = await withUndoTracking({
      userId: ctx.user.id,
      actionType: `Update Lead Status to ${parsedInput.status}`,
      entityType: "website_leads",
      entityId: parsedInput.leadId,
      getPreviousState: async () => {
        const lead = await SalesRepo.getWebsiteLeadById(parsedInput.leadId);
        return lead || {};
      },
      getNewState: async () => {
        return { status: parsedInput.status }; 
      },
      execute: async () => {
        return await SalesRepo.updateWebsiteLeadStatus(parsedInput.leadId, parsedInput.status);
      }
    });

    revalidatePath("/(admin)/sales/leads", "page");
    return { ...result, actionLogId };
  });

export const qualifyLeadAction = internalActionClient
  .schema(qualifyLeadSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is the internal user performing the action
    const result = await SalesService.qualifyLead(parsedInput.leadId, ctx.user.id);
    
    revalidatePath("/(admin)/sales/leads", "page");
    revalidatePath("/(admin)/sales/pipeline", "page");
    
    return result;
  });

/**
 * Public action for clients to approve proposals via a secure link.
 * Does not require authentication.
 */
const approveProposalSchema = z.object({
  proposalId: z.string().uuid("Invalid Proposal ID"),
  sig: z.string().optional(),
  expires: z.string().optional(),
  signatureText: z.string().min(2, "Signature must be at least 2 characters").max(255),
  ipAddress: z.string().max(45).default("0.0.0.0"), // Ideally fetched from headers in route handler
});

export const publicApproveProposalAction = actionClient
  .schema(approveProposalSchema)
  .action(async ({ parsedInput }) => {
    const updated = await SalesService.approveProposalByToken(
      parsedInput.proposalId,
      parsedInput.signatureText,
      parsedInput.ipAddress
    );

    revalidatePath(`/(client)/portal/proposals/${parsedInput.proposalId}`, "page");
    return updated;
  });

const updateDealStageSchema = z.object({
  dealId: z.string().uuid(),
  stage: z.string(),
  organizationId: z.string().uuid(),
  lostReason: z.string().optional(),
});

export const updateDealStageAction = internalActionClient
  .schema(updateDealStageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const SalesRepo = await import("./repositories");
    const { withUndoTracking } = await import("@/modules/core/undo");

    const { result, actionLogId } = await withUndoTracking({
      userId: ctx.user.id,
      actionType: `Move Deal to ${parsedInput.stage}`,
      entityType: "deals",
      entityId: parsedInput.dealId,
      getPreviousState: async () => {
        const deal = await SalesRepo.getDealById(parsedInput.dealId);
        return deal || {};
      },
      getNewState: async () => {
        return { stage: parsedInput.stage };
      },
      execute: async () => {
        return await SalesService.updateDealStageService(
          parsedInput.dealId,
          parsedInput.organizationId,
          parsedInput.stage,
          ctx.user.id,
          parsedInput.lostReason
        );
      }
    });

    revalidatePath("/(admin)/sales/pipeline", "page");
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "page");
    return { ...result, actionLogId };
  });

const createDealSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string(),
  value: z.number().default(0),
  expectedCloseDate: z.string().optional(),
});

export const createDealAction = internalActionClient
  .schema(createDealSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await SalesService.createDealService({
      ...parsedInput,
      ownerId: ctx.user.id,
    });
    
    revalidatePath("/(admin)/sales/pipeline", "page");
    return result;
  });

const updateDealDetailsSchema = z.object({
  dealId: z.string().uuid(),
  name: z.string(),
  value: z.number().default(0),
  expectedCloseDate: z.string().optional().nullable(),
});

export const updateDealDetailsAction = internalActionClient
  .schema(updateDealDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await SalesService.updateDealDetailsService({
      dealId: parsedInput.dealId,
      name: parsedInput.name,
      value: parsedInput.value,
      expectedCloseDate: parsedInput.expectedCloseDate,
      userId: ctx.user.id,
    });
    
    revalidatePath("/(admin)/sales/pipeline", "page");
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "layout");
    return result;
  });

const createDraftProposalSchema = z.object({
  dealId: z.string().uuid(),
});

export const createDraftProposalAction = internalActionClient
  .schema(createDraftProposalSchema)
  .action(async ({ parsedInput }) => {
    const proposal = await SalesService.createDraftProposalService(parsedInput.dealId);
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "layout");
    return proposal;
  });

const addDealLineItemSchema = z.object({
  dealId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  isRecurring: z.boolean().default(false),
});

export const addDealLineItemAction = internalActionClient
  .schema(addDealLineItemSchema)
  .action(async ({ parsedInput }) => {
    await SalesService.addDealLineItemService(parsedInput);
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "layout");
    return true;
  });

const removeDealLineItemSchema = z.object({
  lineItemId: z.string().uuid(),
  dealId: z.string().uuid(),
});

export const removeDealLineItemAction = internalActionClient
  .schema(removeDealLineItemSchema)
  .action(async ({ parsedInput }) => {
    await SalesService.removeDealLineItemService(parsedInput.lineItemId, parsedInput.dealId);
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "layout");
    return true;
  });

const generateProposalDocumentSchema = z.object({
  proposalId: z.string().uuid(),
  dealId: z.string().uuid(),
  dealName: z.string(),
  orgName: z.string(),
});

export const generateProposalDocumentAction = internalActionClient
  .schema(generateProposalDocumentSchema)
  .action(async ({ parsedInput }) => {
    await SalesService.generateProposalWithAIService(
      parsedInput.proposalId, 
      parsedInput.dealName, 
      parsedInput.orgName
    );
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}/proposals/${parsedInput.proposalId}`, "page");
    return true;
  });

const sendProposalSchema = z.object({
  proposalId: z.string().uuid(),
  dealId: z.string().uuid(),
});

export const sendProposalAction = internalActionClient
  .schema(sendProposalSchema)
  .action(async ({ parsedInput }) => {
    const res = await SalesService.sendProposalToClientService(parsedInput.proposalId);
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}`, "layout");
    revalidatePath(`/(admin)/sales/deals/${parsedInput.dealId}/proposals/${parsedInput.proposalId}`, "page");
    return res;
  });

export const submitContactForm = actionClient
  .schema(contactFormSchema)
  .action(async ({ parsedInput }) => {
    // Note: can connect to lead creation service here later
    return { success: true };
  });
