"use server";

import { z } from "zod";
import { internalActionClient, tenantActionClient } from "@/lib/safe-action";
import * as DeliveryService from "./services";
import { revalidatePath } from "next/cache";

const createProjectSchema = z.object({
  dealId: z.string().uuid("Invalid Deal ID"),
  projectName: z.string().min(1, "Project name is required"),
});

/**
 * Internal-only action to manually spawn a project from a confirmed Deal.
 */
export const createProjectAction = internalActionClient
  .schema(createProjectSchema)
  .action(async ({ parsedInput }) => {
    const project = await DeliveryService.createManualProject(
      parsedInput.dealId,
      parsedInput.projectName
    );

    revalidatePath("/delivery/projects");
    return project;
  });

const reviewDeliverableSchema = z.object({
  deliverableId: z.string().uuid("Invalid Deliverable ID"),
  commentText: z.string().optional().default(""),
});

/**
 * Tenant action for a Client to approve a deliverable.
 * Securely bounded by ctx.orgId to ensure they can only approve their own projects.
 */
export const approveDeliverableAction = tenantActionClient
  .schema(reviewDeliverableSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.approveDeliverable(
      parsedInput.deliverableId,
      parsedInput.commentText,
      ctx.userId,
      ctx.orgId
    );

    revalidatePath(`/portal/projects`);
    return result;
  });

/**
 * Tenant action for a Client to request revisions.
 */
export const requestRevisionAction = tenantActionClient
  .schema(reviewDeliverableSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Requires a comment when requesting a revision
    if (!parsedInput.commentText || parsedInput.commentText.trim() === "") {
      throw new Error("A comment is required when requesting revisions.");
    }

    const result = await DeliveryService.requestDeliverableRevision(
      parsedInput.deliverableId,
      parsedInput.commentText,
      ctx.userId,
      ctx.orgId
    );

    revalidatePath(`/portal/projects`);
    return result;
  });
