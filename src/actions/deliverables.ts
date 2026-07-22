"use server";

import { db } from "@/db";
import { deliverables, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createDeliverableSchema, updateDeliverableStatusSchema, CreateDeliverableInput, UpdateDeliverableStatusInput } from "@/lib/validations/delivery";
import { revalidatePath } from "next/cache";
import { createDeliverableService, approveDeliverable, requestDeliverableRevision, submitDeliverableForInternalReview, markDeliverableReadyForClient, submitDeliverableForClientReview } from "@/modules/delivery/services";

export async function createDeliverable(input: CreateDeliverableInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT); 
  
  const parsed = createDeliverableSchema.parse(input);

  const newDeliverable = await createDeliverableService({
    projectId: parsed.projectId,
    name: parsed.name,
    userId: authContext.userId
  });

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true, deliverable: newDeliverable };
}

export async function updateDeliverableStatus(input: UpdateDeliverableStatusInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT);
  
  const parsed = updateDeliverableStatusSchema.parse(input);

  // We are delegating to the appropriate domain service method based on status
  switch(parsed.status) {
    case "internal_review":
      await submitDeliverableForInternalReview(parsed.deliverableId);
      break;
    case "ready_for_client":
      await markDeliverableReadyForClient(parsed.deliverableId);
      break;
    case "client_review":
      await submitDeliverableForClientReview(parsed.deliverableId);
      break;
    case "approved": {
      const orgId = authContext.orgId || (await db.select({ organizationId: deliverables.projectId }).from(deliverables).where(eq(deliverables.id, parsed.deliverableId)))[0]?.organizationId || "";
      await approveDeliverable(parsed.deliverableId, "Approved via action", authContext.userId, orgId);
      break;
    }
    case "draft": {
      const orgId = authContext.orgId || (await db.select({ organizationId: deliverables.projectId }).from(deliverables).where(eq(deliverables.id, parsed.deliverableId)))[0]?.organizationId || "";
      await requestDeliverableRevision(parsed.deliverableId, "Reverted to draft via action", authContext.userId, orgId);
      break;
    }
    default:
      // If we need a raw update we'd have to add it to DeliveryService, but these cover the normal flows
      throw new Error("Unsupported status transition");
  }

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true };
}
