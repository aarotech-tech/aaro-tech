import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks, deliverables, comments, deals } from "@/db/schema";
import type { InferInsertModel } from "drizzle-orm";

export async function createProject(data: InferInsertModel<typeof projects>, tx: any = db) {
  const result = await tx.insert(projects).values(data).returning();
  return result[0];
}

export async function getProjectById(id: string) {
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0] || null;
}

export async function updateProjectStatus(id: string, organizationId: string, status: string, tx: any = db) {
  const result = await tx.update(projects).set({ status }).where(and(eq(projects.id, id), eq(projects.organizationId, organizationId))).returning();
  return result[0];
}

export async function createTask(data: InferInsertModel<typeof tasks>, tx: any = db) {
  const result = await tx.insert(tasks).values(data).returning();
  return result[0];
}
export async function updateTaskStatus(id: string, status: string, tx: any = db) {
  const result = await tx.update(tasks).set({ 
    status,
    completedAt: status === "done" ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(tasks.id, id)).returning();
  return result[0];
}
export async function createDeliverable(data: InferInsertModel<typeof deliverables>) {
  const result = await db.insert(deliverables).values(data).returning();
  return result[0];
}

export async function getDeliverableById(id: string) {
  const result = await db.select().from(deliverables).where(eq(deliverables.id, id)).limit(1);
  return result[0] || null;
}

export async function updateDeliverableStatus(id: string, status: string) {
  const result = await db.update(deliverables).set({ status }).where(eq(deliverables.id, id)).returning();
  return result[0];
}

export async function createComment(data: InferInsertModel<typeof comments>) {
  const result = await db.insert(comments).values(data).returning();
  return result[0];
}

export async function getDealById(id: string) {
  const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  return result[0] || null;
}

export async function getOrganizationByClerkId(clerkOrgId: string) {
  const { organizations } = await import("@/db/schema");
  const result = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)).limit(1);
  return result[0] || null;
}

export async function getUserByClerkId(clerkUserId: string) {
  const { users } = await import("@/db/schema");
  const result = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
  return result[0] || null;
}
