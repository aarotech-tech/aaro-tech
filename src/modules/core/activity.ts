import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type LogActivityParams = {
  organizationId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  userId?: string; 
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
};

export async function logActivity(params: LogActivityParams) {
  let finalUserId = params.userId;

  if (!finalUserId) {
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const userRecord = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
          columns: { id: true }
        });
        if (userRecord) {
          finalUserId = userRecord.id;
        }
      }
    } catch (e) {
      // Ignore auth errors for background jobs
    }
  }

  await db.insert(auditLogs).values({
    organizationId: params.organizationId,
    userId: finalUserId || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    previousValue: params.previousValue ? JSON.stringify(params.previousValue) : null,
    newValue: params.newValue ? JSON.stringify(params.newValue) : null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  });
}
