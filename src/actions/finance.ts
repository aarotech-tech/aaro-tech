"use server";

import { db } from "@/db";
import { invoices, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createInvoiceSchema, recordManualPaymentSchema, verifyPaymentSchema, CreateInvoiceInput, RecordManualPaymentInput, VerifyPaymentInput } from "@/lib/validations/finance";
import { revalidatePath } from "next/cache";
import { eventBus } from "@/modules/core/events";
import { rateLimit } from "@/lib/rate-limit";

export async function createInvoice(input: CreateInvoiceInput) {
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT); // Need FINANCE_EDIT later
  
  const isAllowed = await rateLimit.check(`createInvoice:${authContext.userId}`, 10, 60000);
  if (!isAllowed) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const parsed = createInvoiceSchema.parse(input);

  const [newInvoice] = await db.insert(invoices).values({
    organizationId: parsed.organizationId,
    projectId: parsed.projectId,
    amount: parsed.amount,
    dueDate: parsed.dueDate,
    notes: parsed.notes,
    status: "draft",
    createdBy: authContext.userId,
    updatedBy: authContext.userId,
  }).returning();

  eventBus.emit({
    type: "InvoiceCreated",
    payload: {
      organizationId: parsed.organizationId,
      invoiceId: newInvoice.id,
      amount: parsed.amount,
      userId: authContext.userId,
    }
  });

  revalidatePath("/(admin)/finance", "layout");
  return { success: true, invoice: newInvoice };
}

export async function recordManualPayment(input: RecordManualPaymentInput) {
  // Client can record their own payment, but it stays pending until admin verifies.
  const authContext = await authorize(PERMISSIONS.PROJECT_VIEW); 
  
  const parsed = recordManualPaymentSchema.parse(input);

  const [newPayment] = await db.insert(payments).values({
    invoiceId: parsed.invoiceId,
    amount: parsed.amount,
    method: parsed.method,
    referenceNumber: parsed.referenceNumber,
    paidAt: parsed.paidAt,
    notes: parsed.notes,
    status: "pending",
    createdBy: authContext.userId,
    updatedBy: authContext.userId,
  }).returning();

  revalidatePath("/(client)/portal/billing/[invoiceId]", "page");
  return { success: true, payment: newPayment };
}

export async function verifyPayment(input: VerifyPaymentInput) {
  // Only admin can verify
  const authContext = await authorize(PERMISSIONS.DEAL_EDIT);
  
  const parsed = verifyPaymentSchema.parse(input);

  const [updatedPayment] = await db.update(payments)
    .set({
      status: parsed.status,
      verifiedAt: new Date(),
      verifiedBy: authContext.userId,
      notes: parsed.notes,
      updatedAt: new Date(),
      updatedBy: authContext.userId
    })
    .where(eq(payments.id, parsed.paymentId))
    .returning();

  if (updatedPayment && parsed.status === "verified") {
    // Check if the invoice is fully paid
    const invoicePayments = await db.query.payments.findMany({
      where: and(
        eq(payments.invoiceId, updatedPayment.invoiceId),
        eq(payments.status, "verified")
      )
    });

    const totalVerified = invoicePayments.reduce((acc, p) => acc + p.amount, 0);
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, updatedPayment.invoiceId)
    });

    if (invoice) {
      let newStatus = invoice.status;
      if (totalVerified >= invoice.amount) {
        newStatus = "paid";
      } else if (totalVerified > 0) {
        newStatus = "partially_paid";
      }

      if (newStatus !== invoice.status) {
        await db.update(invoices)
          .set({ status: newStatus, updatedAt: new Date(), updatedBy: authContext.userId })
          .where(eq(invoices.id, invoice.id));
      }
    }
  }

  revalidatePath("/(admin)/finance", "layout");
  revalidatePath("/(client)/portal/billing/[invoiceId]", "page");
  return { success: true };
}
