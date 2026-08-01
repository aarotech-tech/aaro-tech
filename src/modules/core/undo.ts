"use server";

import { db } from "@/db";
import { userActionLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Reverts a previously executed action using the user_action_logs table.
 * It identifies the entityType and performs the appropriate update using the previousState.
 */
export async function revertAction(actionLogId: string) {
  try {
    const [actionLog] = await db
      .select()
      .from(userActionLogs)
      .where(eq(userActionLogs.id, actionLogId));

    if (!actionLog) {
      return { serverError: "Action log not found" };
    }

    if (!actionLog.canUndo) {
      return { serverError: "This action can no longer be undone" };
    }

    const previousState = JSON.parse(actionLog.previousState);

    // Depending on the entityType, we execute the rollback logic
    switch (actionLog.entityType) {
      case "website_leads":
        const { websiteLeads } = await import("@/db/schema");
        await db
          .update(websiteLeads)
          .set(previousState)
          .where(eq(websiteLeads.id, actionLog.entityId));
        break;

      case "deals":
        const { deals } = await import("@/db/schema");
        await db
          .update(deals)
          .set(previousState)
          .where(eq(deals.id, actionLog.entityId));
        break;

      default:
        return { serverError: `Undo for entity type ${actionLog.entityType} is not supported yet` };
    }

    // Mark the action as undone so it can't be repeatedly undone
    await db
      .update(userActionLogs)
      .set({ canUndo: false })
      .where(eq(userActionLogs.id, actionLogId));

    return { data: { success: true } };
  } catch (error) {
    console.error("Undo execution failed:", error);
    return { serverError: "Failed to undo action" };
  }
}

/**
 * Utility wrapper to capture states before and after a mutation.
 */
export async function withUndoTracking<T>({
  userId,
  actionType,
  entityType,
  entityId,
  getPreviousState,
  getNewState,
  execute,
}: {
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  getPreviousState: () => Promise<Record<string, any>>;
  getNewState: () => Promise<Record<string, any>>;
  execute: () => Promise<T>;
}) {
  // Capture before state
  const previousState = await getPreviousState();

  // Execute actual mutation
  const result = await execute();

  // Capture after state
  const newState = await getNewState();

  // Log to database
  const [log] = await db
    .insert(userActionLogs)
    .values({
      userId,
      actionType,
      entityType,
      entityId,
      previousState: JSON.stringify(previousState),
      newState: JSON.stringify(newState),
    })
    .returning({ id: userActionLogs.id });

  return { result, actionLogId: log.id };
}
