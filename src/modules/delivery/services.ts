import * as DeliveryRepo from "./repositories";
import { emitDomainEvent } from "../core/events";

/**
 * Creates a project manually from a Deal.
 */
export async function createManualProject(dealId: string, projectName: string) {
  const deal = await DeliveryRepo.getDealById(dealId);
  
  if (!deal) {
    throw new Error("Deal not found");
  }

  // 1. Scaffold Project
  const project = await DeliveryRepo.createProject({
    organizationId: deal.organizationId,
    dealId: deal.id,
    name: projectName || `${deal.name} - Execution`,
    status: "active",
    health: "green",
  });

  // 2. Default task scaffolding (Template could be added here later)
  await DeliveryRepo.createTask({
    projectId: project.id,
    title: "Project Kickoff",
    status: "todo",
  });

  // 3. Emit Domain Event
  emitDomainEvent({
    type: "ProjectCreated",
    payload: {
      projectId: project.id,
      projectName: project.name,
      organizationId: project.organizationId,
    }
  });

  return project;
}

/**
 * Internal action to submit a deliverable for client review.
 */
export async function submitDeliverableForReview(deliverableId: string) {
  const deliverable = await DeliveryRepo.updateDeliverableStatus(deliverableId, "in_review");
  return deliverable;
}

/**
 * Client action to approve a deliverable.
 */
export async function approveDeliverable(deliverableId: string, commentText: string, clerkUserId: string, clerkOrgId: string) {
  const org = await DeliveryRepo.getOrganizationByClerkId(clerkOrgId);
  if (!org) throw new Error("Organization not found");

  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  
  const project = await DeliveryRepo.getProjectById(deliverable.projectId!);
  if (project?.organizationId !== org.id) {
    throw new Error("Unauthorized to approve this deliverable");
  }

  const updated = await DeliveryRepo.updateDeliverableStatus(deliverableId, "approved");

  let userId = "";
  if (commentText) {
    const user = await DeliveryRepo.getUserByClerkId(clerkUserId);
    if (user) {
      userId = user.id;
      await DeliveryRepo.createComment({
        deliverableId,
        userId: user.id,
        text: commentText,
        visibility: "client_visible",
      });
    }
  } else {
    const user = await DeliveryRepo.getUserByClerkId(clerkUserId);
    if (user) userId = user.id;
  }

  emitDomainEvent({
    type: "DeliverableApproved",
    payload: {
      deliverableId,
      projectId: project.id,
      organizationId: org.id,
      userId,
    }
  });

  return updated;
}

/**
 * Client action to request revision on a deliverable.
 */
export async function requestDeliverableRevision(deliverableId: string, commentText: string, clerkUserId: string, clerkOrgId: string) {
  const org = await DeliveryRepo.getOrganizationByClerkId(clerkOrgId);
  if (!org) throw new Error("Organization not found");

  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  
  const project = await DeliveryRepo.getProjectById(deliverable.projectId!);
  if (project?.organizationId !== org.id) {
    throw new Error("Unauthorized to access this deliverable");
  }

  const updated = await DeliveryRepo.updateDeliverableStatus(deliverableId, "changes_requested");

  let userId = "";
  const user = await DeliveryRepo.getUserByClerkId(clerkUserId);
  if (user) {
    userId = user.id;
    await DeliveryRepo.createComment({
      deliverableId,
      userId: user.id,
      text: commentText,
      visibility: "client_visible",
    });
  }

  emitDomainEvent({
    type: "RevisionRequested",
    payload: {
      deliverableId,
      projectId: project.id,
      organizationId: org.id,
      userId,
    }
  });

  return updated;
}
