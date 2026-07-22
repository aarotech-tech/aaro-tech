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
    // 1. Add the line item
    await db.insert(dealLineItems).values({
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
    const items = await db.query.dealLineItems.findMany({
      where: eq(dealLineItems.dealId, data.dealId)
    });
    const totalValue = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    await db.update(deals).set({ value: totalValue }).where(eq(deals.id, data.dealId));

    revalidatePath(`/sales/proposals/${data.proposalId}`);
    return { success: true };
  });

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

    // 1. Fetch proposal + deal + org
    const proposalData = await db
      .select({
        id: proposals.id,
        status: proposals.status,
        documentData: proposals.documentData,
        dealId: deals.id,
        dealName: deals.name,
        organizationId: deals.organizationId,
        organizationName: organizations.name,
      })
      .from(proposals)
      .innerJoin(deals, eq(proposals.dealId, deals.id))
      .innerJoin(organizations, eq(deals.organizationId, organizations.id))
      .where(eq(proposals.id, proposalId))
      .limit(1);

    if (proposalData.length === 0) throw new AppError("Proposal not found", 404);
    const proposal = proposalData[0];

    if (!proposal.documentData) {
      throw new AppError("Cannot send an empty proposal. Please generate or write content first.", 400);
    }

    // 2. Set status to 'sent' with a 30-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.update(proposals)
      .set({ status: "sent", expiresAt })
      .where(eq(proposals.id, proposalId));

    // 3. Find client's email from organization members
    const member = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, proposal.organizationId))
      .limit(1);

    const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal/proposals/${proposal.id}`;

    if (member.length > 0) {
      // Send email to client
      await sendEmail({
        to: member[0].email,
        subject: `Proposal Ready: ${proposal.dealName} — Aarotech`,
        html: `
          <h2>Your Proposal is Ready</h2>
          <p>Hello ${member[0].firstName || proposal.organizationName},</p>
          <p>We have prepared a proposal for <strong>${proposal.dealName}</strong>.</p>
          <p>Please review it and sign off to get started:</p>
          <p><a href="${portalLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View &amp; Approve Proposal</a></p>
          <p>This link expires in 30 days.</p>
          <br/>
          <p>Thank you,<br/>The Aarotech Team</p>
        `,
      });
    } else {
      // No member yet — log a warning but still mark as sent
      console.warn(`No organization member found for org ${proposal.organizationId}. Proposal marked as sent but no email delivered.`);
    }

    revalidatePath(`/crm/proposals/${proposalId}`);
    revalidatePath(`/crm/proposals`);
    return { portalLink };
  });
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

