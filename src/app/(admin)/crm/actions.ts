"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { deals, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth";

export async function updateDealStage(dealId: string, newStage: string) {
  return withActionErrorHandling('updateDealStage', async () => {
    const user = await requireInternalUser();
    
    await db.update(deals)
      .set({ stage: newStage })
      .where(eq(deals.id, dealId));
    
    // If the deal is won, automatically convert the organization to a client
    if (newStage === "won") {
      const dealData = await db.query.deals.findFirst({
        where: eq(deals.id, dealId),
        columns: { organizationId: true, name: true }
      });
      
      if (dealData) {
        // 1. Check if the org is still a lead
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, dealData.organizationId)
        });

        if (org && org.type === "lead") {
          // Update organization type
          await db.update(organizations)
            .set({ type: "client" })
            .where(eq(organizations.id, dealData.organizationId));

          // Log the status history
          const { organizationStatusHistory, clientOnboardings, onboardingSteps } = await import("@/db/schema");
          
          await db.insert(organizationStatusHistory).values({
            organizationId: dealData.organizationId,
            fromStatus: "lead",
            toStatus: "client",
            changedById: user.id
          });

          // Create an Onboarding Checklist
          const [onboarding] = await db.insert(clientOnboardings).values({
            organizationId: dealData.organizationId,
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
          
        // Phase 5 Automation: Create a corresponding Project for the newly won deal
        const { projects, automationLogs } = await import("@/db/schema");
        await db.insert(projects).values({
          organizationId: dealData.organizationId,
          dealId: dealId,
          name: `${dealData.name} Fulfillment`, // Use the deal name for the project
          status: "active",
          health: "green",
        });

        // Phase 7 Automation: Trigger background job mock
        await db.insert(automationLogs).values({
          jobName: "deal-won-alert",
          status: "success",
          payload: JSON.stringify({ dealId, clientName: dealData.name }),
          completedAt: new Date(),
        });
      }
    }
    const dealData = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
      columns: { organizationId: true }
    });

    if (dealData) {
      try {
        const { redis } = await import("@/lib/redis");
        if (redis) {
          await redis.del(`org:${dealData.organizationId}:activeProjects`);
        }
      } catch (err) {
        console.error("Failed to invalidate Redis cache:", err);
      }
    }
    
    revalidatePath("/crm");
    revalidatePath("/crm/clients");
    return true;
  });
}

export async function createDeal(formData: FormData) {
  return withActionErrorHandling('createDeal', async () => {
    await requireInternalUser();
    const name = formData.get("name") as string;
    const value = parseInt(formData.get("value") as string) || 0;
    const organizationName = formData.get("organizationName") as string;

    if (!name || !organizationName) {
      throw new AppError("Missing required fields", 400);
    }

    let orgId: string;
    const { organizations } = await import("@/db/schema");
    
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.name, organizationName)
    });

    if (existingOrg) {
      orgId = existingOrg.id;
    } else {
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      const newOrg = await db.insert(organizations).values({
        name: organizationName,
        type: "lead",
        clerkOrgId: `lead_${Date.now()}`,
        slug: slug,
      }).returning({ id: organizations.id });
      orgId = newOrg[0].id;
    }

    await db.insert(deals).values({
      name,
      value,
      organizationId: orgId,
      stage: "discovery",
    });
    
    try {
      const { redis } = await import("@/lib/redis");
      if (redis) {
        await redis.del(`org:${orgId}:activeProjects`);
      }
    } catch (err) {
      console.error("Failed to invalidate Redis cache:", err);
    }
    
    revalidatePath("/crm");
    return true;
  });
}

export async function generateProposal(dealId: string) {
  return withActionErrorHandling('generateProposal', async () => {
    await requireInternalUser();
    const { proposals } = await import("@/db/schema");
    const newProposal = await db.insert(proposals).values({
      dealId,
      status: "draft",
      documentData: "<h1>Statement of Work</h1><p>This is a standard template for the selected deal.</p>",
    }).returning({ id: proposals.id });
    
    revalidatePath("/crm/proposals");
    return { proposalId: newProposal[0].id };
  });
}

