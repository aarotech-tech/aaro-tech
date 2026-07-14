"use server";

import { db } from "@/db";
import { deals, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateDealStage(dealId: string, newStage: string) {
  try {
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
        await db.update(organizations)
          .set({ type: "client" })
          .where(eq(organizations.id, dealData.organizationId));
          
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
    
    revalidatePath("/crm");
    return { success: true };
  } catch (error) {
    console.error("Failed to update deal stage:", error);
    return { success: false, error: "Failed to update deal stage" };
  }
}

export async function createDeal(formData: FormData) {
  const name = formData.get("name") as string;
  const value = parseInt(formData.get("value") as string) || 0;
  const organizationName = formData.get("organizationName") as string;

  if (!name || !organizationName) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    // Check if organization exists, otherwise create it
    let orgId: string;
    
    // Using Drizzle to find the organization
    // Note: We need to import 'organizations' from schema in this file
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
    
    revalidatePath("/crm");
    return { success: true };
  } catch (error) {
    console.error("Failed to create deal:", error);
    return { success: false, error: "Failed to create deal" };
  }
}

export async function generateProposal(dealId: string) {
  const { proposals } = await import("@/db/schema");
  try {
    const newProposal = await db.insert(proposals).values({
      dealId,
      status: "draft",
      documentData: "<h1>Statement of Work</h1><p>This is a standard template for the selected deal.</p>",
    }).returning({ id: proposals.id });
    
    revalidatePath("/crm/proposals");
    return { success: true, proposalId: newProposal[0].id };
  } catch (error) {
    console.error("Failed to generate proposal:", error);
    return { success: false, error: "Failed to generate proposal" };
  }
}
