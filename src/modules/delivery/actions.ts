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
    const project = await DeliveryService.createProjectFromDeal(
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

// --- Internal Lifecycle Actions ---

const projectLifecycleSchema = z.object({
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export const planProjectAction = internalActionClient
  .schema(projectLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.planProject(parsedInput.projectId, parsedInput.organizationId);
    revalidatePath("/delivery/projects");
    return result;
  });

export const activateProjectAction = internalActionClient
  .schema(projectLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.activateProject(parsedInput.projectId, parsedInput.organizationId);
    revalidatePath("/delivery/projects");
    return result;
  });

const deliverableLifecycleSchema = z.object({
  deliverableId: z.string().uuid(),
});

export const submitDeliverableForInternalReviewAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.submitDeliverableForInternalReview(parsedInput.deliverableId);
    revalidatePath("/delivery/reviews");
    return result;
  });

export const markDeliverableReadyForClientAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.markDeliverableReadyForClient(parsedInput.deliverableId);
    revalidatePath("/delivery/reviews");
    return result;
  });

export const submitDeliverableForClientReviewAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.submitDeliverableForClientReview(parsedInput.deliverableId);
    revalidatePath("/delivery/reviews");
    return result;
  });
