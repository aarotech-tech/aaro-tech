"use server";

import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createDealSchema, updateDealStageSchema, CreateDealInput, UpdateDealStageInput } from "@/lib/validations/crm";
import { revalidatePath } from "next/cache";
import { createDealService, updateDealStageService } from "@/modules/sales/services";
import { emitDomainEvent } from "@/modules/core/events";

export async function createDeal(input: CreateDealInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_CREATE);
  
  const parsed = createDealSchema.parse(input);

  const newDeal = await createDealService({
    organizationId: parsed.organizationId,
    name: parsed.name,
    value: parsed.value,
    expectedCloseDate: parsed.expectedCloseDate,
    ownerId: authContext.userId
  });

  revalidatePath("/(admin)/sales/pipeline", "page");
  return { success: true, deal: newDeal };
}

export async function updateDealStage(input: UpdateDealStageInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT);
  
  const parsed = updateDealStageSchema.parse(input);

  const dealOrgId = authContext.orgId || (await db.select({ organizationId: deals.organizationId }).from(deals).where(eq(deals.id, parsed.dealId)))[0]?.organizationId;
  
  if (!dealOrgId) throw new Error("Organization not found for deal");

  const updatedDeal = await updateDealStageService(
    parsed.dealId,
    dealOrgId,
    parsed.stage,
    authContext.userId
  );

  if (parsed.stage === "won" && updatedDeal) {
    await emitDomainEvent({
      type: "DealWon",
      payload: {
        organizationId: updatedDeal.organizationId,
        dealId: updatedDeal.id,
        dealName: updatedDeal.name
      }
    });
  }

  revalidatePath("/(admin)/sales/pipeline", "page");
  return { success: true };
}
