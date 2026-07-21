"use server";

import { z } from "zod";
import { internalActionClient, actionClient } from "@/lib/safe-action";
import * as SalesService from "./services";
import { revalidatePath } from "next/cache";

/**
 * Qualifies a lead. Requires internal agency access.
 */
const qualifyLeadSchema = z.object({
  leadId: z.string().uuid("Invalid Lead ID"),
});

export const qualifyLeadAction = internalActionClient
  .schema(qualifyLeadSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is the internal user performing the action
    const result = await SalesService.qualifyLead(parsedInput.leadId, ctx.user.id);
    
    revalidatePath("/sales/leads");
    revalidatePath("/sales/pipeline");
    
    return result;
  });

/**
 * Public action for clients to approve proposals via a secure link.
 * Does not require authentication.
 */
const approveProposalSchema = z.object({
  proposalId: z.string().uuid("Invalid Proposal ID"),
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

    revalidatePath(`/portal/proposals/${parsedInput.proposalId}`);
    
    return updated;
  });
