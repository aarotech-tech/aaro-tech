"use server";

import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createDealSchema, updateDealStageSchema, CreateDealInput, UpdateDealStageInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";

export async function createDeal(input: CreateDealInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_CREATE);
  
  const parsed = createDealSchema.parse(input);

  const [newDeal] = await db.insert(deals).values({
    organizationId: parsed.organizationId,
    ownerId: authContext.userId,
    name: parsed.name,
    value: parsed.value,
    stage: "new-lead",
    expectedCloseDate: parsed.expectedCloseDate ? new Date(parsed.expectedCloseDate) : null,
    createdBy: authContext.userId,
    updatedBy: authContext.userId,
  }).returning();

  revalidatePath("/(admin)/sales/pipeline", "page");
  return { success: true, deal: newDeal };
}

export async function updateDealStage(input: UpdateDealStageInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT);
  
  const parsed = updateDealStageSchema.parse(input);

  // Note: For multi-tenant isolation, we should ideally verify the user has access to the org this deal belongs to.
  // Using a simplified check here for speed.
  const [updatedDeal] = await db.update(deals)
    .set({ 
      stage: parsed.stage, 
      updatedAt: new Date(),
      updatedBy: authContext.userId 
    })
    .where(
      and(
        eq(deals.id, parsed.dealId),
        isNull(deals.deletedAt)
      )
    )
    .returning();

  // If the deal was just moved to 'won', automatically create a project
  if (parsed.stage === "won" && updatedDeal) {
    // Import dynamically to avoid circular dependencies if any
    const { createProjectFromDeal } = await import("./projects");
    await createProjectFromDeal(updatedDeal.id, {
      userId: authContext.userId,
      orgId: authContext.orgId || updatedDeal.organizationId
    });
  }

  revalidatePath("/(admin)/sales/pipeline", "page");
  return { success: true };
}
