"use server";

import { db } from "@/db";
import { organizations, organizationStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createLeadSchema, CreateLeadInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

export async function createLead(input: CreateLeadInput) {
  const authContext = await authorize(PERMISSIONS.ORG_EDIT); // Need internal edit permission for now
  
  const isAllowed = await rateLimit.check(`createLead:${authContext.userId}`, 10, 60000); // 10 per minute
  if (!isAllowed) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const parsed = createLeadSchema.parse(input);

  const [newOrg] = await db.insert(organizations).values({
    name: parsed.businessName || parsed.name,
    clerkOrgId: "lead_" + Date.now().toString(),
    slug: parsed.businessName ? parsed.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    type: "lead",
    status: "lead",
    createdBy: authContext.userId,
    updatedBy: authContext.userId,
  }).returning();

  // Would normally also create a 'contact' linked to this organization with the parsed.email and parsed.name, omitted for brevity

  revalidatePath("/(admin)/sales/leads", "page");
  return { success: true, lead: newOrg };
}

export async function convertLeadToDeal(organizationId: string) {
  const authContext = await authorize(PERMISSIONS.DEAL_CREATE);
  
  // Update org status
  await db.update(organizations)
    .set({ 
      status: "prospect", 
      updatedAt: new Date(),
      updatedBy: authContext.userId 
    })
    .where(eq(organizations.id, organizationId));

  // Record audit history
  await db.insert(organizationStatusHistory).values({
    organizationId,
    fromStatus: "lead",
    toStatus: "prospect",
    changedById: authContext.userId,
  });

  // Note: the actual Deal record creation is handled in deals.ts actions
  
  revalidatePath("/(admin)/sales/leads", "page");
  return { success: true };
}
