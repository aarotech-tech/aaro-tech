"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { proposals, deals, organizations, projects, automationLogs, organizationStatusHistory, clientOnboardings, onboardingSteps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";
import { rateLimit } from '@/lib/rate-limit';

export async function approveProposalAction(proposalId: string, formData: FormData) {
  return withActionErrorHandling('approveProposalAction', async () => {
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown";

    await rateLimit.check(`proposal_approval_${ip}`, { points: 5, durationInSeconds: 3600 });

    const signature = formData.get("signature") as string;
    
    if (!signature) throw new AppError("Signature is required", 400);

    const proposal = await db.query.proposals.findFirst({ where: eq(proposals.id, proposalId) });
    if (!proposal) throw new AppError("Proposal not found", 404);
    if (proposal.status !== "draft") throw new AppError("Proposal is no longer valid or already accepted", 400);
    
    const now = new Date();
    if (proposal.expiresAt && proposal.expiresAt < now) {
      throw new AppError("Proposal approval link has expired", 400);
    }
    
    // If expiresAt is null, enforce a default 30-day expiration based on createdAt
    if (!proposal.expiresAt && proposal.createdAt) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (proposal.createdAt < thirtyDaysAgo) {
        throw new AppError("Proposal approval link has expired (exceeded 30 days)", 400);
      }
    }
    
    const deal = await db.query.deals.findFirst({ where: eq(deals.id, proposal.dealId) });
    if (!deal) throw new AppError("Deal not found", 404);

    // ip is already extracted above

    // 1. Mark Proposal as accepted
    await db.update(proposals)
      .set({ 
        status: "accepted",
        approvedAt: new Date(),
        signatureText: signature,
        approvedByIp: ip,
      })
      .where(eq(proposals.id, proposalId));

    // 2. Mark Deal as Won
    await db.update(deals)
      .set({ stage: "won" })
      .where(eq(deals.id, deal.id));

    // 3. Perform Lead to Client Conversion (if they are a lead)
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, deal.organizationId)
    });

    if (org && org.type === "lead") {
      await db.update(organizations)
        .set({ type: "client" })
        .where(eq(organizations.id, deal.organizationId));

      await db.insert(organizationStatusHistory).values({
        organizationId: deal.organizationId,
        fromStatus: "lead",
        toStatus: "client",
      });

      const [onboarding] = await db.insert(clientOnboardings).values({
        organizationId: deal.organizationId,
        status: "pending"
      }).returning({ id: clientOnboardings.id });

      if (onboarding) {
        await db.insert(onboardingSteps).values([
          { onboardingId: onboarding.id, title: "Initial Deposit Paid", status: "pending" },
          { onboardingId: onboarding.id, title: "Brand Assets Collected", status: "pending" },
          { onboardingId: onboarding.id, title: "Kickoff Call Scheduled", status: "pending" },
          { onboardingId: onboarding.id, title: "Project Brief Signed", status: "pending" },
        ]);
      }
    }

    // 4. Create a corresponding Project for the newly won deal
    await db.insert(projects).values({
      organizationId: deal.organizationId,
      dealId: deal.id,
      name: `${deal.name} Fulfillment`,
      status: "active",
      health: "green",
    });

    // 5. Trigger background job real pending state
    await db.insert(automationLogs).values({
      jobName: "deal-won-alert",
      status: "queued",
      payload: JSON.stringify({ dealId: deal.id, clientName: deal.name }),
      completedAt: null,
    });

    revalidatePath(`/portal/proposals/${proposalId}`);
    revalidatePath(`/crm/proposals/${proposalId}`);
    revalidatePath("/crm");
    revalidatePath("/crm/clients");
    
    return true;
  });
}
