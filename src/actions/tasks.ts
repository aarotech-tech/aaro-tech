"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { updateTaskStatusService } from "@/modules/delivery/services";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { updateTaskStatusSchema, UpdateTaskStatusInput } from "@/lib/validations/delivery";
import { revalidatePath } from "next/cache";
import { eventBus } from "@/modules/core/events";

export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT); // Ideally PROJECT_EDIT but reusing for now
  
  const parsed = updateTaskStatusSchema.parse(input);

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, parsed.taskId),
    with: { project: true }
  });
  if (!task || !task.project) throw new Error("Task not found");

  const updatedTask = await updateTaskStatusService(
    parsed.taskId,
    parsed.status,
    task.projectId,
    (task as any).project.organizationId,
    authContext.userId
  );

  if (updatedTask) {
    // We could emit a "TaskStatusChanged" event if defined in DomainEvent
    // For now we rely on the schema activity logs
  }

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true };
}
