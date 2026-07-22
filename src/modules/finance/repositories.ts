import { db } from "@/db";
import { invoices, payments, organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class FinanceRepository {
  async createInvoice(data: typeof invoices.$inferInsert, tx: any = db) {
    const [invoice] = await tx.insert(invoices).values(data).returning();
    return invoice;
  }

  async findInvoiceById(id: string) {
    return db.query.invoices.findFirst({
      where: eq(invoices.id, id)
    });
  }

  async updateInvoice(id: string, data: Partial<typeof invoices.$inferInsert>, tx: any = db) {
    return tx.update(invoices).set(data).where(eq(invoices.id, id)).returning();
  }

  async createPayment(data: typeof payments.$inferInsert, tx: any = db) {
    const [payment] = await tx.insert(payments).values(data).returning();
    return payment;
  }

  async findPaymentById(id: string) {
    return db.query.payments.findFirst({
      where: eq(payments.id, id)
    });
  }

  async updatePayment(id: string, data: Partial<typeof payments.$inferInsert>, tx: any = db) {
    return tx.update(payments).set(data).where(eq(payments.id, id)).returning();
  }
}

export const financeRepository = new FinanceRepository();
