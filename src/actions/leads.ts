"use server";

import { db } from "@/db";
import { organizations, organizationStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createLeadSchema, CreateLeadInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { createLeadService, convertLeadToDealService } from "@/modules/sales/services";

export async function createLead(input: CreateLeadInput) {
  const authContext = await authorize(PERMISSIONS.ORG_EDIT); 
  
  const isAllowed = await rateLimit.check(`createLead:${authContext.userId}`, 10, 60000); 
  if (!isAllowed) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const parsed = createLeadSchema.parse(input);

  const newOrg = await createLeadService({
    name: parsed.businessName || parsed.name,
    userId: authContext.userId
  });

  revalidatePath("/(admin)/sales/leads", "page");
  return { success: true, lead: newOrg };
}

export async function convertLeadToDeal(organizationId: string) {
  const authContext = await authorize(PERMISSIONS.DEAL_CREATE);
  
  await convertLeadToDealService(organizationId, authContext.userId);

  // Note: the actual Deal record creation is handled in deals.ts actions
  
  revalidatePath("/(admin)/sales/leads", "page");
  return { success: true };
}
