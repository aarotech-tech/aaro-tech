import * as DeliveryRepo from "./repositories";
import { emitDomainEvent } from "../core/events";
import { DbTx } from "@/db/types";

export type ProjectStatus = "pending" | "planned" | "active" | "on_hold" | "completed" | "archived";
export type DeliverableStatus = "draft" | "internal_review" | "ready_for_client" | "client_review" | "approved" | "archived";

/**
 * Validates project status transition.
 */
function validateProjectTransition(current: string, next: ProjectStatus) {
  const validTransitions: Record<string, ProjectStatus[]> = {
    pending: ["planned"],
    planned: ["active"],
    active: ["on_hold", "completed"],
    on_hold: ["active", "archived"],
    completed: ["archived"],
  };
  
  const allowed = validTransitions[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Invalid project state transition from ${current} to ${next}`);
  }
}

/**
 * Validates deliverable status transition.
 */
function validateDeliverableTransition(current: string, next: DeliverableStatus) {
  const validTransitions: Record<string, DeliverableStatus[]> = {
    draft: ["internal_review"],
    internal_review: ["draft", "ready_for_client"], // draft is rejected internally
    ready_for_client: ["client_review"],
    client_review: ["draft", "approved"], // draft indicates changes requested
    approved: ["archived"],
  };
  
  const allowed = validTransitions[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Invalid deliverable state transition from ${current} to ${next}`);
  }
}

/**
 * Instantiates a project from a Deal (Triggered ONLY by Conversion Engine).
 */
export async function createProjectFromDeal(dealId: string, projectName: string, tx?: DbTx) {
  const deal = await DeliveryRepo.getDealById(dealId);
  
  if (!deal) {
    throw new Error("Deal not found");
  }

  // 1. Scaffold Project (Initial state is pending)
  const project = await DeliveryRepo.createProject({
    organizationId: deal.organizationId,
    dealId: deal.id,
    name: projectName || `${deal.name} - Execution`,
    status: "pending",
    health: "green",
  }, tx);

  // 2. Default task scaffolding
  await DeliveryRepo.createTask({
    projectId: project.id,
    title: "Project Kickoff",
    status: "todo",
  }, tx);

  return project;
}

/**
 * Plans a project (PM action).
 */
export async function planProject(projectId: string, organizationId: string, tx?: DbTx) {
  const project = await DeliveryRepo.getProjectById(projectId);
  if (!project) throw new Error("Project not found");
  if (project.organizationId !== organizationId) throw new Error("Unauthorized");
  
  validateProjectTransition(project.status || "pending", "planned");

  return DeliveryRepo.updateProjectStatus(projectId, organizationId, "planned", tx);
}

/**
 * Activates a project (Often triggered by Finance deposit paid or PM action).
 */
export async function activateProject(projectId: string, organizationId: string, tx?: DbTx) {
  const project = await DeliveryRepo.getProjectById(projectId);
  if (!project) throw new Error("Project not found");
  if (project.organizationId !== organizationId) throw new Error("Unauthorized");
  
  validateProjectTransition(project.status || "planned", "active");

  return DeliveryRepo.updateProjectStatus(projectId, organizationId, "active", tx);
}

/**
 * Internal action to submit a deliverable for internal review.
 */
export async function createDeliverableService(data: { projectId: string; name: string; userId: string }) {
  const deliverable = await DeliveryRepo.createDeliverable({
    projectId: data.projectId,
    name: data.name,
    status: "draft",
  });
  
  // Note: we can fetch the project to get the organizationId, but since we are emitting the event
  // without it for now (like in the original action), we'll do the same, or fetch it.
  const project = await DeliveryRepo.getProjectById(data.projectId);
  
  if (project) {
    emitDomainEvent({
      type: "DeliverableSubmitted",
      payload: {
        organizationId: project.organizationId,
        projectId: data.projectId,
        deliverableId: deliverable.id,
        userId: data.userId,
      }
    });
  }

  return deliverable;
}

export async function submitDeliverableForInternalReview(deliverableId: string) {
  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  validateDeliverableTransition(deliverable.status || "draft", "internal_review");
  
  return DeliveryRepo.updateDeliverableStatus(deliverableId, "internal_review");
}

/**
 * Internal action to mark a deliverable ready for client.
 */
export async function markDeliverableReadyForClient(deliverableId: string) {
  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  validateDeliverableTransition(deliverable.status || "internal_review", "ready_for_client");
  
  return DeliveryRepo.updateDeliverableStatus(deliverableId, "ready_for_client");
}

/**
 * Internal action to submit a deliverable for client review.
 */
export async function submitDeliverableForClientReview(deliverableId: string) {
  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  validateDeliverableTransition(deliverable.status || "ready_for_client", "client_review");
  
  return DeliveryRepo.updateDeliverableStatus(deliverableId, "client_review");
}

/**
 * Client action to approve a deliverable.
 */
export async function approveDeliverable(deliverableId: string, commentText: string, clerkUserId: string, clerkOrgId: string) {
  const org = await DeliveryRepo.getOrganizationByClerkId(clerkOrgId);
  if (!org) throw new Error("Organization not found");

  const deliverable = await DeliveryRepo.getDeliverableById(deliverableId);
  if (!deliverable) throw new Error("Deliverable not found");
  
  let organizationId: string | null = null;
  if (deliverable.projectId) {
    const project = await DeliveryRepo.getProjectById(deliverable.projectId);
    organizationId = project?.organizationId || null;
  } else if (deliverable.retainerPeriodId) {
    const { db } = require('@/db');
    const { retainerPeriods, retainers } = require('@/db/schema');
    const { eq } = require('drizzle-orm');
    const result = await db
      .select({ organizationId: retainers.organizationId })
      .from(retainerPeriods)
      .innerJoin(retainers, eq(retainerPeriods.retainerId, retainers.id))
      .where(eq(retainerPeriods.id, deliverable.retainerPeriodId))
      .limit(1);
    organizationId = result[0]?.organizationId || null;
  }

  if (organizationId !== org.id) {
    throw new Error("Unauthorized to approve this deliverable");
  }

  validateDeliverableTransition(deliverable.status || "client_review", "approved");

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
  }

  emitDomainEvent({
    type: "DeliverableApproved",
    payload: {
      deliverableId,
      projectId: deliverable.projectId || "",
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
  
  let organizationId: string | null = null;
  if (deliverable.projectId) {
    const project = await DeliveryRepo.getProjectById(deliverable.projectId);
    organizationId = project?.organizationId || null;
  } else if (deliverable.retainerPeriodId) {
    const { db } = require('@/db');
    const { retainerPeriods, retainers } = require('@/db/schema');
    const { eq } = require('drizzle-orm');
    const result = await db
      .select({ organizationId: retainers.organizationId })
      .from(retainerPeriods)
      .innerJoin(retainers, eq(retainerPeriods.retainerId, retainers.id))
      .where(eq(retainerPeriods.id, deliverable.retainerPeriodId))
      .limit(1);
    organizationId = result[0]?.organizationId || null;
  }

  if (organizationId !== org.id) {
    throw new Error("Unauthorized to access this deliverable");
  }

  validateDeliverableTransition(deliverable.status || "client_review", "draft");

  const updated = await DeliveryRepo.updateDeliverableStatus(deliverableId, "draft");

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
    type: "DeliverableRejected",
    payload: {
      deliverableId,
      projectId: deliverable.projectId || "",
      organizationId: org.id,
      userId,
    }
  });

  return updated;
}

export async function getDashboardMetrics() {
  const { db } = require('@/db');
  const { projects, tasks, deliverables } = require('@/db/schema');
  const { sql, eq } = require('drizzle-orm');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Projects stats
  const projectsStats = await db.select({
    activeProjects: sql<number>`cast(count(case when ${projects.status} = 'active' then 1 end) as integer)`,
    projectsAtRisk: sql<number>`cast(count(case when ${projects.health} in ('red', 'yellow') then 1 end) as integer)`,
    projectsCompletedThisMonth: sql<number>`cast(count(case when ${projects.status} = 'completed' and ${projects.updatedAt} >= ${startOfMonth} then 1 end) as integer)`,
  }).from(projects);

  // Tasks stats
  const tasksStats = await db.select({
    tasksDueToday: sql<number>`cast(count(case when ${tasks.dueDate} <= ${endOfDay} and ${tasks.dueDate} >= current_date and ${tasks.status} != 'done' then 1 end) as integer)`,
    overdueTasks: sql<number>`cast(count(case when ${tasks.dueDate} < current_date and ${tasks.status} != 'done' then 1 end) as integer)`,
  }).from(tasks);

  // Deliverables stats
  const deliverablesStats = await db.select({
    deliverablesAwaitingReview: sql<number>`cast(count(case when ${deliverables.status} = 'client_review' then 1 end) as integer)`,
  }).from(deliverables);

  const ps = projectsStats[0] || {};
  const ts = tasksStats[0] || {};
  const ds = deliverablesStats[0] || {};

  return {
    activeProjects: ps.activeProjects || 0,
    projectsAtRisk: ps.projectsAtRisk || 0,
    tasksDueToday: ts.tasksDueToday || 0,
    overdueTasks: ts.overdueTasks || 0,
    deliverablesAwaitingReview: ds.deliverablesAwaitingReview || 0,
    projectsCompletedThisMonth: ps.projectsCompletedThisMonth || 0,
  };
}

// --- CLIENT PORTAL READ MODELS (BFF Layer) --- //

export async function getClientProjects(organizationId: string) {
  const { db } = require('@/db');
  const { projects } = require('@/db/schema');
  const { eq } = require('drizzle-orm');

  const allProjects = await db.select().from(projects).where(eq(projects.organizationId, organizationId));
  
  return allProjects.map((p: any) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    health: p.health || "green",
    progress: p.completionPercentage || 0,
    nextMilestone: "Ongoing",
  }));
}

export async function getClientProjectDetails(projectId: string, organizationId: string) {
  const { db } = require('@/db');
  const { projects, deliverables, tasks } = require('@/db/schema');
  const { eq, and } = require('drizzle-orm');

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)),
    with: {
      deliverables: true,
      tasks: true,
    }
  });

  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    status: project.status,
    overview: project.description || "Project overview",
    deliverables: project.deliverables.map((d: any) => ({
      id: d.id,
      name: d.name,
      status: d.status || "draft",
    })),
    timeline: project.tasks.map((t: any) => ({
      phase: t.title,
      status: t.status === "done" ? "completed" : (t.status === "in_progress" ? "active" : "pending"),
    }))
  };
}

export async function getClientDeliverables(organizationId: string) {
  const { db } = await import("@/db");
  const { deliverables, projects } = await import("@/db/schema");
  const { eq, desc } = await import("drizzle-orm");

  return await db.select({
    id: deliverables.id,
    name: deliverables.name,
    status: deliverables.status,
    createdAt: deliverables.createdAt,
    projectName: projects.name
  })
  .from(deliverables)
  .leftJoin(projects, eq(deliverables.projectId, projects.id))
  .where(eq(projects.organizationId, organizationId))
  .orderBy(desc(deliverables.createdAt));
}

export async function submitClientReviewService(
  deliverableId: string,
  versionId: string,
  action: "approve" | "request_changes",
  commentText?: string,
  userId?: string
) {
  const { db } = require('@/db');
  const { deliverables, deliverableVersions, comments, projects, retainerPeriods, retainers, auditLogs } = require('@/db/schema');
  const { eq } = require('drizzle-orm');
  const { sendDeliverableClientResponseEmail } = require('@/lib/email');

  const deliverable = await db.query.deliverables.findFirst({
    where: eq(deliverables.id, deliverableId)
  });

  if (!deliverable) throw new Error("Deliverable not found");

  let orgId = null;

  if (deliverable.projectId) {
    const p = await db.query.projects.findFirst({ where: eq(projects.id, deliverable.projectId) });
    orgId = p?.organizationId;
  } else if (deliverable.retainerPeriodId) {
    const rp = await db.query.retainerPeriods.findFirst({ where: eq(retainerPeriods.id, deliverable.retainerPeriodId) });
    if (rp) {
      const r = await db.query.retainers.findFirst({ where: eq(retainers.id, rp.retainerId) });
      orgId = r?.organizationId;
    }
  }

  if (!orgId) throw new Error("Deliverable ownership could not be verified");

  if (commentText && commentText.trim() !== "" && userId) {
    await db.insert(comments).values({
      deliverableId,
      versionId,
      userId,
      text: commentText,
      visibility: "client_visible"
    });
  }

  const newReviewStatus = action === "approve" ? "approved" : "changes_requested";
  await db.update(deliverableVersions)
    .set({ reviewStatus: newReviewStatus })
    .where(eq(deliverableVersions.id, versionId));

  const newDeliverableStatus = action === "approve" ? "approved" : "changes_requested";
  await db.update(deliverables)
    .set({ status: newDeliverableStatus })
    .where(eq(deliverables.id, deliverableId));

  if (userId) {
    await db.insert(auditLogs).values({
      organizationId: orgId,
      userId,
      action: `deliverable.${action}`,
      entityType: "deliverable",
      entityId: deliverableId,
      metadata: JSON.stringify({ versionId })
    });
  }

  await sendDeliverableClientResponseEmail("info@aarotech.in", deliverable.name, newDeliverableStatus);
  return { orgId };
}


import { db } from "@/db";
import { projects, tasks, milestones, activityLogs, files } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export async function getProjectsService(organizationId?: string) {
  if (organizationId) {
    return db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
      orderBy: [desc(projects.createdAt)],
      with: {
        organization: true,
      },
    });
  }
  return db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
    with: {
      organization: true,
    },
  });
}

export async function getProjectByIdService(projectId: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      organization: true,
    },
  });
}

export async function getProjectTasksService(projectId: string) {
  return db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: [asc(tasks.createdAt)],
    with: {
      assignee: true,
    },
  });
}

export async function getProjectMilestonesService(projectId: string) {
  return db.query.milestones.findMany({
    where: eq(milestones.projectId, projectId),
    orderBy: [asc(milestones.dueDate)],
  });
}

export async function getProjectActivitiesService(projectId: string) {
  return db.query.activityLogs.findMany({
    where: and(
      eq(activityLogs.entityType, "project"),
      eq(activityLogs.entityId, projectId)
    ),
    orderBy: [desc(activityLogs.createdAt)],
    with: {
      user: true,
    },
  });
}

export async function getProjectFilesService(projectId: string) {
  return db.query.files.findMany({
    where: eq(files.projectId, projectId),
    orderBy: [desc(files.createdAt)],
    with: {
      uploadedBy: true,
    }
  });
}

export async function logProjectActivity(
  organizationId: string,
  projectId: string,
  action: string,
  userId?: string,
  metadata?: any
) {
  await db.insert(activityLogs).values({
    organizationId,
    entityType: "project",
    entityId: projectId,
    action,
    userId,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

// Tasks
export async function createTaskService(data: {
  projectId: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
  userId: string;
}) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, data.projectId) });
  if (!project || project.organizationId !== data.organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [task] = await db.insert(tasks).values({
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    priority: data.priority || "medium",
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    assigneeId: data.assigneeId,
    createdBy: data.userId,
    status: "todo",
  }).returning();

  await logProjectActivity(data.organizationId, data.projectId, "task.created", data.userId, { taskId: task.id, title: task.title });
  
  return task;
}

export async function updateTaskStatusService(
  taskId: string,
  status: string,
  projectId: string,
  organizationId: string,
  userId: string
) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project || project.organizationId !== organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [task] = await db.update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  await logProjectActivity(organizationId, projectId, "task.status_changed", userId, { taskId: task.id, title: task.title, status });
  
  return task;
}

// Milestones
export async function createMilestoneService(data: {
  projectId: string;
  organizationId: string;
  name: string;
  dueDate?: string;
  userId: string;
}) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, data.projectId) });
  if (!project || project.organizationId !== data.organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [milestone] = await db.insert(milestones).values({
    projectId: data.projectId,
    name: data.name,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
  }).returning();

  await logProjectActivity(data.organizationId, data.projectId, "milestone.created", data.userId, { milestoneId: milestone.id, name: milestone.name });
  
  return milestone;
}

export async function updateMilestoneStatusService(
  milestoneId: string,
  status: string,
  projectId: string,
  organizationId: string,
  userId: string
) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project || project.organizationId !== organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [milestone] = await db.update(milestones)
    .set({ 
      status, 
      completedAt: status === "completed" ? new Date() : null,
      updatedAt: new Date() 
    })
    .where(eq(milestones.id, milestoneId))
    .returning();

  if (status === "completed") {
    await logProjectActivity(organizationId, projectId, "milestone.completed", userId, { milestoneId: milestone.id, name: milestone.name });
  }

  return milestone;
}

export async function updateTaskDetailsService(
  taskId: string,
  data: { title: string; description?: string; priority?: string; dueDate?: string; assigneeId?: string },
  projectId: string,
  organizationId: string,
  userId: string
) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project || project.organizationId !== organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [task] = await db.update(tasks)
    .set({
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId,
      updatedAt: new Date()
    })
    .where(eq(tasks.id, taskId))
    .returning();

  await logProjectActivity(organizationId, projectId, "task.updated", userId, { taskId: task.id, title: task.title });
  
  return task;
}

export async function deleteTaskService(
  taskId: string,
  projectId: string,
  organizationId: string,
  userId: string
) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project || project.organizationId !== organizationId) {
    throw new Error("Unauthorized: Project does not belong to the specified organization.");
  }

  const [task] = await db.delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();

  if (task) {
    await logProjectActivity(organizationId, projectId, "task.deleted", userId, { taskId: task.id, title: task.title });
  }
  
  return task;
}
