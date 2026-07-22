"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { proposals, dealLineItems, deals, services, organizations, organizationMembers, users } from "@/db/schema";
import { eq, sum } from "drizzle-orm";
import { requireInternalUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

import { internalActionClient } from "@/lib/safe-action";
import { addDealLineItemSchema } from "@/lib/validations/proposal";

export const addDealLineItemAction = internalActionClient
  .schema(addDealLineItemSchema)
  .action(async ({ parsedInput: data }) => {
    await db.transaction(async (tx) => {
      // 1. Add the line item
      await tx.insert(dealLineItems).values({
        dealId: data.dealId,
        serviceId: data.serviceId || null,
        title: data.title,
        description: data.description || null,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        total: data.unitPrice * data.quantity,
        isRecurring: data.isRecurring,
      });

      // 2. Recalculate total deal value
      const items = await tx.query.dealLineItems.findMany({
        where: eq(dealLineItems.dealId, data.dealId)
      });
      const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      await tx.update(deals).set({ value: totalValue }).where(eq(deals.id, data.dealId));
    });

    revalidatePath(`/sales/proposals/${data.proposalId}`);
    return { success: true };
  });

export async function removeDealLineItem(proposalId: string, dealId: string, lineItemId: string) {
  return withActionErrorHandling('removeDealLineItem', async () => {
    await requireInternalUser();

    await db.transaction(async (tx) => {
      await tx.delete(dealLineItems).where(eq(dealLineItems.id, lineItemId));
      
      const items = await tx.query.dealLineItems.findMany({
        where: eq(dealLineItems.dealId, dealId)
      });
      const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      await tx.update(deals).set({ value: totalValue }).where(eq(deals.id, dealId));
    });
    
    revalidatePath(`/crm/proposals/${proposalId}`);
    return true;
  });
}

async function recalculateDealValue(dealId: string) {
  // Query all line items for this deal
  const items = await db.query.dealLineItems.findMany({
    where: eq(dealLineItems.dealId, dealId)
  });
  
  // Calculate total: unitPrice * quantity
  const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
  // Update deal
  await db.update(deals).set({ value: totalValue }).where(eq(deals.id, dealId));
}

export async function saveDraftAction(proposalId: string, documentData: string) {
  return withActionErrorHandling('saveDraftAction', async () => {
    await requireInternalUser();

    await db.update(proposals)
      .set({ documentData })
      .where(eq(proposals.id, proposalId));

    revalidatePath(`/crm/proposals/${proposalId}`);
    return true;
  });
}

export async function sendProposalToClientAction(proposalId: string) {
  return withActionErrorHandling('sendProposalToClientAction', async () => {
    await requireInternalUser();
    const { sendProposalToClientService } = await import("@/modules/sales/services");
    const result = await sendProposalToClientService(proposalId);
    
    revalidatePath(`/crm/proposals/${proposalId}`);
    revalidatePath(`/crm/proposals`);
    return result;
  });
}

export async function generateProposalWithAI(proposalId: string, dealName: string, orgName: string) {
  return withActionErrorHandling('generateProposalWithAI', async () => {
    await requireInternalUser();
    
    const { generateProposalWithAIService } = await import("@/modules/sales/services");
    await generateProposalWithAIService(proposalId, dealName, orgName);
      
    revalidatePath(`/crm/proposals/${proposalId}`);
    return true;
  });
}

