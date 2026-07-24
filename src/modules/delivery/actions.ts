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

    revalidatePath("/(admin)/delivery/projects", "page");
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

    revalidatePath(`/(client)/portal/projects`, "page");
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

    revalidatePath(`/(client)/portal/projects`, "page");
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
    revalidatePath("/(admin)/delivery/projects", "page");
    return result;
  });

export const activateProjectAction = internalActionClient
  .schema(projectLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.activateProject(parsedInput.projectId, parsedInput.organizationId);
    revalidatePath("/(admin)/delivery/projects", "page");
    return result;
  });

const deliverableLifecycleSchema = z.object({
  deliverableId: z.string().uuid(),
});

export const submitDeliverableForInternalReviewAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.submitDeliverableForInternalReview(parsedInput.deliverableId);
    revalidatePath("/(admin)/delivery/reviews", "page");
    return result;
  });

export const markDeliverableReadyForClientAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.markDeliverableReadyForClient(parsedInput.deliverableId);
    revalidatePath("/(admin)/delivery/reviews", "page");
    return result;
  });

export const submitDeliverableForClientReviewAction = internalActionClient
  .schema(deliverableLifecycleSchema)
  .action(async ({ parsedInput }) => {
    const result = await DeliveryService.submitDeliverableForClientReview(parsedInput.deliverableId);
    revalidatePath("/(admin)/delivery/reviews", "page");
    return result;
  });



// Task Actions
const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const createTaskAction = internalActionClient
  .schema(createTaskSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.createTaskService({
      ...parsedInput,
      userId: ctx.user.id,
    });
    
    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}/board`, "page");
    return result;
  });

const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.string(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export const updateTaskStatusAction = internalActionClient
  .schema(updateTaskStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.updateTaskStatusService(
      parsedInput.taskId,
      parsedInput.status,
      parsedInput.projectId,
      parsedInput.organizationId,
      ctx.user.id
    );

    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}/board`, "page");
    return result;
  });

const updateTaskDetailsSchema = z.object({
  taskId: z.string().uuid(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const updateTaskAction = internalActionClient
  .schema(updateTaskDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.updateTaskDetailsService(
      parsedInput.taskId,
      {
        title: parsedInput.title,
        description: parsedInput.description,
        priority: parsedInput.priority,
        dueDate: parsedInput.dueDate,
        assigneeId: parsedInput.assigneeId,
      },
      parsedInput.projectId,
      parsedInput.organizationId,
      ctx.user.id
    );

    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}/board`, "page");
    return result;
  });

const deleteTaskSchema = z.object({
  taskId: z.string().uuid(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export const deleteTaskAction = internalActionClient
  .schema(deleteTaskSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.deleteTaskService(
      parsedInput.taskId,
      parsedInput.projectId,
      parsedInput.organizationId,
      ctx.user.id
    );

    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}/board`, "page");
    return result;
  });

// Milestone Actions
const createMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  dueDate: z.string().optional(),
});

export const createMilestoneAction = internalActionClient
  .schema(createMilestoneSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.createMilestoneService({
      ...parsedInput,
      userId: ctx.user.id,
    });
    
    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}`, "page");
    return result;
  });

const updateMilestoneStatusSchema = z.object({
  milestoneId: z.string().uuid(),
  status: z.string(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

export const updateMilestoneStatusAction = internalActionClient
  .schema(updateMilestoneStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await DeliveryService.updateMilestoneStatusService(
      parsedInput.milestoneId,
      parsedInput.status,
      parsedInput.projectId,
      parsedInput.organizationId,
      ctx.user.id
    );

    revalidatePath(`/(admin)/delivery/projects/${parsedInput.projectId}`, "page");
    return result;
  });
