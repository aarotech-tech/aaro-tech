import { inngest } from "../client";
import { db } from "@/db";
import { outboxEvents } from "@/db/schema";
import { eq, inArray, and, lt, sql } from "drizzle-orm";

export const processOutbox = inngest.createFunction(
  { id: "process-outbox", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    // 1. Claim a batch of pending events using an atomic update
    // Drizzle doesn't have native SKIP LOCKED in update yet, so we use a raw SQL subquery for PostgreSQL
    const claimedEvents = await step.run("claim-pending-events", async () => {
      const result = await db.execute(sql`
        UPDATE outbox_events
        SET status = 'processing'
        WHERE id IN (
          SELECT id FROM outbox_events
          WHERE status = 'pending' 
             OR (status = 'processing' AND updated_at < NOW() - INTERVAL '5 minutes')
          ORDER BY created_at ASC
          LIMIT 50
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `);
      return (result as any).rows ? (result as any).rows as any[] : (result as unknown as any[]);
    });

    if (!claimedEvents || claimedEvents.length === 0) {
      return { message: "No pending events to process" };
    }

    // 2. Dispatch events
    const results = await step.run("dispatch-events", async () => {
      const successfulIds: string[] = [];
      const failedIds: string[] = [];

      for (const event of claimedEvents) {
        try {
          await inngest.send({
            name: event.type as any,
            data: event.payload,
          });
          successfulIds.push(event.id);
        } catch (error) {
          console.error(`Failed to dispatch outbox event ${event.id}:`, error);
          failedIds.push(event.id);
        }
      }
      return { successfulIds, failedIds };
    });

    // 3. Update statuses back to DB
    await step.run("update-outbox-statuses", async () => {
      if (results.successfulIds.length > 0) {
        await db.update(outboxEvents)
          .set({ status: 'processed', processedAt: new Date() })
          .where(inArray(outboxEvents.id, results.successfulIds));
      }

      if (results.failedIds.length > 0) {
        await db.execute(sql`
          UPDATE outbox_events
          SET status = CASE 
            WHEN retry_count >= 3 THEN 'failed'
            ELSE 'pending'
          END,
          retry_count = retry_count + 1
          WHERE id IN (SELECT unnest(${results.failedIds}::uuid[]))
        `);
      }
    });

    // 4. Cleanup old processed events (Retention Policy: 7 days)
    await step.run("cleanup-processed-events", async () => {
      await db.execute(sql`
        DELETE FROM outbox_events
        WHERE status = 'processed' 
        AND processed_at < NOW() - INTERVAL '7 days'
      `);
    });

    return {
      processed: results.successfulIds.length,
      failed: results.failedIds.length,
    };
  }
);
