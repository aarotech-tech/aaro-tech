import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/db';
import { outboxEvents } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function checkOutbox() {
  const pending = await db.query.outboxEvents.findMany({
    where: eq(outboxEvents.status, 'pending')
  });
  console.log("Pending events:", pending.length);
  const failed = await db.query.outboxEvents.findMany({
    where: eq(outboxEvents.status, 'failed')
  });
  console.log("Failed events:", failed.length);
  const processing = await db.query.outboxEvents.findMany({
    where: eq(outboxEvents.status, 'processing')
  });
  console.log("Processing events:", processing.length);
  const processed = await db.query.outboxEvents.findMany({
    where: eq(outboxEvents.status, 'processed')
  });
  console.log("Processed events:", processed.length);
}
checkOutbox();
