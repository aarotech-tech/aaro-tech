"use server";

import { db } from "@/db";
import { deliverables } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createDeliverableSchema, updateDeliverableStatusSchema, CreateDeliverableInput, UpdateDeliverableStatusInput } from "@/lib/validations/delivery";
import { revalidatePath } from "next/cache";
import { eventBus } from "@/modules/core/events";

export async function createDeliverable(input: CreateDeliverableInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT); 
  
  const parsed = createDeliverableSchema.parse(input);

  const [newDeliverable] = await db.insert(deliverables).values({
    projectId: parsed.projectId,
    name: parsed.name,
    status: "draft",
    // Note: To properly support versioning according to their schema, 
    // we would also insert into `files` and `deliverableVersions` here.
    // Simplifying for MVP since we just need the placeholder record for now.
  }).returning();

  eventBus.emit({
    type: "DeliverableUploaded",
    payload: {
      organizationId: "", // ideally fetched from project
      projectId: parsed.projectId,
      deliverableId: newDeliverable.id,
      userId: authContext.userId,
    }
  });

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true, deliverable: newDeliverable };
}

export async function updateDeliverableStatus(input: UpdateDeliverableStatusInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT);
  
  const parsed = updateDeliverableStatusSchema.parse(input);

  const [updatedDeliverable] = await db.update(deliverables)
    .set({ 
      status: parsed.status
    })
    .where(
      eq(deliverables.id, parsed.deliverableId)
    )
    .returning();

  if (parsed.status === "approved" && updatedDeliverable) {
    eventBus.emit({
      type: "DeliverableApproved",
      payload: {
        organizationId: "", // ideally fetched
        projectId: updatedDeliverable.projectId!,
        deliverableId: updatedDeliverable.id,
        userId: authContext.userId,
      }
    });
  }

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true };
}
