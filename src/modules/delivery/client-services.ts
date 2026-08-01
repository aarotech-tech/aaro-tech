import { db } from "@/db";
import { projects, deliverables, milestones, activityLogs, files, invoices, tasks } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export async function getClientProjects(organizationId: string) {
  return await db.query.projects.findMany({
    where: eq(projects.organizationId, organizationId),
    orderBy: [desc(projects.createdAt)],
  });
}

export async function getClientProjectDetails(projectId: string, organizationId: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)),
  });

  if (!project) return null;

  const projectDeliverables = await db.query.deliverables.findMany({
    where: eq(deliverables.projectId, projectId),
  });

  const projectMilestones = await db.query.milestones.findMany({
    where: eq(milestones.projectId, projectId),
    orderBy: [asc(milestones.dueDate)],
  });

  const projectActivities = await db.query.activityLogs.findMany({
    where: and(
      eq(activityLogs.entityType, "project"),
      eq(activityLogs.entityId, projectId)
    ),
    orderBy: [desc(activityLogs.createdAt)],
    limit: 15,
  });
  
  const projectFiles = await db.query.files.findMany({
    where: eq(files.projectId, projectId),
    orderBy: [desc(files.createdAt)],
  });
  
  const projectInvoices = await db.query.invoices.findMany({
    where: eq(invoices.projectId, projectId),
    orderBy: [desc(invoices.createdAt)],
    with: {
        payments: true
    }
  });

  const projectTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
  });

  return {
    ...project,
    deliverables: projectDeliverables,
    milestones: projectMilestones,
    activities: projectActivities,
    files: projectFiles,
    invoices: projectInvoices,
    tasks: projectTasks
  };
}
