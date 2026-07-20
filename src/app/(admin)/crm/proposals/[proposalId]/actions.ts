"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { proposals, dealLineItems, deals, services } from "@/db/schema";
import { eq, sum } from "drizzle-orm";
import { requireInternalUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addDealLineItem(
  proposalId: string,
  dealId: string, 
  data: {
    serviceId?: string;
    title: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    isRecurring: boolean;
  }
) {
  return withActionErrorHandling('addDealLineItem', async () => {
    await requireInternalUser();

    // 1. Add the line item
    await db.insert(dealLineItems).values({
      dealId,
      serviceId: data.serviceId || null,
      title: data.title,
      description: data.description || null,
      unitPrice: data.unitPrice,
      quantity: data.quantity,
      total: data.unitPrice * data.quantity,
      isRecurring: data.isRecurring,
    });

    // 2. Recalculate total deal value
    const items = await db.query.dealLineItems.findMany({
      where: eq(dealLineItems.dealId, dealId)
    });
    const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    await db.update(deals).set({ value: totalValue }).where(eq(deals.id, dealId));

    revalidatePath(`/crm/proposals/${proposalId}`);
    return true;
  });
}

export async function removeDealLineItem(proposalId: string, dealId: string, lineItemId: string) {
  return withActionErrorHandling('removeDealLineItem', async () => {
    await requireInternalUser();

    await db.delete(dealLineItems).where(eq(dealLineItems.id, lineItemId));
    
    const items = await db.query.dealLineItems.findMany({
      where: eq(dealLineItems.dealId, dealId)
    });
    const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    await db.update(deals).set({ value: totalValue }).where(eq(deals.id, dealId));
    
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

export async function generateProposalWithAI(proposalId: string, dealName: string, orgName: string) {
  return withActionErrorHandling('generateProposalWithAI', async () => {
    await requireInternalUser();
    
    // Fetch actual deal line items
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId)
    });
    
    if (!proposal) throw new AppError("Proposal not found", 404);
    
    const items = await db.query.dealLineItems.findMany({
      where: eq(dealLineItems.dealId, proposal.dealId)
    });

    // Calculate total
    const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    // Generate dynamic HTML based on actual items
    let scopeOfWorkHtml = "";
    if (items.length === 0) {
      scopeOfWorkHtml = "<p><em>No specific services have been scoped yet.</em></p>";
    } else {
      scopeOfWorkHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
              <th style="padding: 12px 8px;">Service</th>
              <th style="padding: 12px 8px;">Description</th>
              <th style="padding: 12px 8px; text-align: right;">Qty</th>
              <th style="padding: 12px 8px; text-align: right;">Price</th>
              <th style="padding: 12px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 8px; font-weight: 500;">${item.title} ${item.isRecurring ? '(Recurring)' : ''}</td>
                <td style="padding: 12px 8px; color: #4b5563; font-size: 0.875rem;">${item.description || ''}</td>
                <td style="padding: 12px 8px; text-align: right;">${item.quantity}</td>
                <td style="padding: 12px 8px; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 500;">$${item.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const dynamicProposalHtml = `
      <h1>Proposal for ${orgName}</h1>
      <p>Dear ${orgName} Team,</p>
      <p>Thank you for considering Aarotech for your upcoming project: <strong>${dealName}</strong>. 
      Based on our initial conversations, we have prepared the following strategic roadmap and investment summary to help you achieve your goals.</p>
      
      <h2>1. Executive Summary</h2>
      <p>Our objective is to deliver a robust, scalable solution tailored specifically to the needs of the ${orgName} ecosystem. We understand that time-to-market and premium quality are your top priorities.</p>
      
      <h2>2. Scope of Work & Investment</h2>
      ${scopeOfWorkHtml}
      
      <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: right;">
        <h3 style="margin: 0; color: #111827;">Total Estimated Investment</h3>
        <p style="margin: 4px 0 0 0; font-size: 1.25rem; font-weight: 700; color: #16a34a;">$${totalValue.toLocaleString()}</p>
      </div>
      
      <h2>3. Timeline & Next Steps</h2>
      <p>We anticipate this engagement will commence within 1-2 weeks upon signing of this proposal. If the scope and investment align with your expectations, please approve this proposal digitally to kick off the project!</p>
      
      <p>We look forward to partnering with you on this exciting initiative.</p>
      <p>Best regards,<br/>The Aarotech Team</p>
    `;
    
    await db.update(proposals)
      .set({ documentData: dynamicProposalHtml })
      .where(eq(proposals.id, proposalId));
      
    revalidatePath(`/crm/proposals/${proposalId}`);
    return true;
  });
}

