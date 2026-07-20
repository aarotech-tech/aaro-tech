"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { websiteLeads, organizations, deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

export async function promoteLeadToDeal(leadId: string) {
  return withActionErrorHandling('promoteLeadToDeal', async () => {
    const internalUser = await requireInternalUser();
    
    // 1. Fetch the lead (outside transaction to fail fast if not found)
    const leads = await db.select().from(websiteLeads).where(eq(websiteLeads.id, leadId)).limit(1);
    const lead = leads[0];
    
    if (!lead) throw new AppError("Lead not found", 404);
    if (lead.status === "promoted") throw new AppError("Lead is already promoted", 400);

    const orgName = lead.businessName || lead.name;
    const randId = crypto.randomUUID();
    const slug = `lead-${randId}`;

    // 2. Create Clerk Organization first
    const client = await clerkClient();
    const clerkOrg = await client.organizations.createOrganization({
      name: orgName,
      createdBy: internalUser.clerkId,
      slug: slug,
    });

    try {
      // 3. Sequential Database Operations (Transaction not supported by neon-http)
      const [newOrg] = await db.insert(organizations).values({
        name: orgName,
        clerkOrgId: clerkOrg.id,
        slug,
        type: "lead",
      }).returning();

      const dealName = lead.challenge ? `Lead: ${lead.challenge.substring(0, 50)}` : `New Deal: ${orgName}`;
      
      await db.insert(deals).values({
        organizationId: newOrg.id,
        name: dealName,
        stage: "discovery",
        value: 0,
      });

      await db.update(websiteLeads)
        .set({ status: "promoted", updatedAt: new Date() })
        .where(eq(websiteLeads.id, leadId));
        
      try {
        const { redis } = await import("@/lib/redis");
        if (redis) {
          await redis.del(`org:${newOrg.id}:activeProjects`);
        }
      } catch (err) {
        console.error("Failed to invalidate Redis cache:", err);
      }
    } catch (dbError) {
      // 4. Rollback Clerk Org if DB fails
      console.error("DB Transaction failed, rolling back Clerk Organization...", dbError);
      try {
        await client.organizations.deleteOrganization(clerkOrg.id);
      } catch (rollbackError) {
        console.error("Failed to rollback Clerk Organization:", rollbackError);
      }
      throw dbError; // Re-throw to be handled by withActionErrorHandling
    }

    revalidatePath("/crm/leads");
    revalidatePath("/crm");

    return true;
  });
}
