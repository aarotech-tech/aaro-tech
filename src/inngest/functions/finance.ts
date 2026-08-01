import { inngest } from "../client";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { emitDomainEvent } from "@/modules/core/events";

export const checkOverdueInvoices = inngest.createFunction(
  { 
    id: "check-overdue-invoices", 
    name: "Check Overdue Invoices",
    triggers: [{ cron: "0 1 * * *" }]
  },
  async ({ step }) => {
    const overdueInvoices = await step.run("find-overdue-invoices", async () => {
      const now = new Date();
      
      const overdue = await db.select()
        .from(invoices)
        .where(and(
          eq(invoices.status, "open"),
          lt(invoices.dueDate, now)
        ));
        
      return overdue;
    });

    if (overdueInvoices.length > 0) {
      await step.run("update-and-notify", async () => {
        for (const invoice of overdueInvoices) {
          // Update status to overdue
          await db.update(invoices)
            .set({ status: "overdue", updatedAt: new Date() })
            .where(eq(invoices.id, invoice.id));
            
          // Emit event for notification system
          await emitDomainEvent({
            type: "InvoiceCreated", // Placeholder for Overdue event if not defined
            payload: {
              organizationId: invoice.organizationId,
              invoiceId: invoice.id,
              amount: invoice.amount,
            }
          });
        }
      });
    }

    return { count: overdueInvoices.length };
  }
);
