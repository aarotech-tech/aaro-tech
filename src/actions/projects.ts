"use server";

import { db } from "@/db";
import { projects, tasks, deals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { eventBus } from "@/modules/core/events";
import { revalidatePath } from "next/cache";

export async function createProjectFromDeal(dealId: string, authContext: { userId: string; orgId: string }) {
  // Fetch the deal to carry over properties
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId));
  if (!deal) throw new Error("Deal not found");

  // Create Project
  const [project] = await db.insert(projects).values({
    organizationId: deal.organizationId,
    dealId: deal.id,
    ownerId: deal.ownerId,
    name: `${deal.name} Delivery`,
    status: "active",
    health: "green",
    value: deal.value,
    expectedDeliveryDate: deal.expectedCloseDate, // Or some offset logic
    createdBy: authContext.userId,
    updatedBy: authContext.userId,
  }).returning();

  // Initialize Default Tasks
  await db.insert(tasks).values([
    {
      projectId: project.id,
      title: "Project Kickoff",
      status: "todo",
      priority: "high",
      createdBy: authContext.userId,
      updatedBy: authContext.userId,
    },
    {
      projectId: project.id,
      title: "Planning & Strategy",
      status: "todo",
      priority: "medium",
      createdBy: authContext.userId,
      updatedBy: authContext.userId,
    },
    {
      projectId: project.id,
      title: "Initial Milestone",
      status: "todo",
      priority: "medium",
      createdBy: authContext.userId,
      updatedBy: authContext.userId,
    }
  ]);

  // Log Activity
  eventBus.emit({
    type: "ProjectCreated",
    payload: {
      organizationId: project.organizationId,
      projectId: project.id,
      projectName: project.name,
      userId: authContext.userId,
    }
  });

  revalidatePath("/(admin)/delivery/projects", "page");
  return project;
}
