import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/db';
import { outboxEvents } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from './src/inngest/client';

async function flushOutbox() {
  const pending = await db.query.outboxEvents.findMany({
    where: eq(outboxEvents.status, 'pending')
  });
  
  console.log(`Found ${pending.length} pending events. Flushing directly...`);
  
  for (const event of pending) {
    console.log(`Sending ${event.type}...`);
    try {
      await inngest.send({
        name: event.type as any,
        data: event.payload,
      });
      
      await db.update(outboxEvents)
        .set({ status: 'processed', processedAt: new Date() })
        .where(eq(outboxEvents.id, event.id));
        
      console.log(`Success: ${event.type}`);
    } catch (e) {
      console.error(`Error sending ${event.type}:`, e);
    }
  }
}

flushOutbox();
