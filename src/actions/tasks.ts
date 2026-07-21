"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { updateTaskStatusSchema, UpdateTaskStatusInput } from "@/lib/validations/delivery";
import { revalidatePath } from "next/cache";
import { eventBus } from "@/modules/core/events";

export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT); // Ideally PROJECT_EDIT but reusing for now
  
  const parsed = updateTaskStatusSchema.parse(input);

  const [updatedTask] = await db.update(tasks)
    .set({ 
      status: parsed.status,
      completedAt: parsed.status === "done" ? new Date() : null,
      updatedAt: new Date(),
      updatedBy: authContext.userId 
    })
    .where(
      and(
        eq(tasks.id, parsed.taskId),
        isNull(tasks.deletedAt)
      )
    )
    .returning();

  if (updatedTask) {
    // We could emit a "TaskStatusChanged" event if defined in DomainEvent
    // For now we rely on the schema activity logs
  }

  revalidatePath("/(admin)/delivery/projects/[id]", "page");
  return { success: true };
}
