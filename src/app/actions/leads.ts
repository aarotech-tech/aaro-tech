"use server";

import { db } from "@/db";
import { websiteLeads, organizations, deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function promoteLeadToDeal(leadId: string) {
  try {
    // 1. Fetch the lead
    const leads = await db.select().from(websiteLeads).where(eq(websiteLeads.id, leadId)).limit(1);
    const lead = leads[0];
    
    if (!lead) return { success: false, error: "Lead not found" };
    if (lead.status === "promoted") return { success: false, error: "Lead is already promoted" };

    // 2. Create Organization
    const randId = crypto.randomUUID();
    const orgName = lead.businessName || lead.name;
    const slug = `lead-${randId}`;
    const clerkOrgId = `pending_${randId}`;

    const [newOrg] = await db.insert(organizations).values({
      name: orgName,
      clerkOrgId,
      slug,
      type: "lead",
    }).returning();

    // 3. Create Deal
    const dealName = lead.challenge ? `Lead: ${lead.challenge.substring(0, 50)}` : `New Deal: ${orgName}`;
    
    await db.insert(deals).values({
      organizationId: newOrg.id,
      name: dealName,
      stage: "discovery",
      value: 0,
    });

    // 4. Update Lead Status
    await db.update(websiteLeads)
      .set({ status: "promoted", updatedAt: new Date() })
      .where(eq(websiteLeads.id, leadId));

    revalidatePath("/crm/leads");
    revalidatePath("/crm");

    return { success: true };
  } catch (error) {
    console.error("Failed to promote lead:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
