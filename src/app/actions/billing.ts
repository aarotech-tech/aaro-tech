"use server";

import { db } from "@/db";
import { invoices, payments, organizations, activityLogs } from "@/db/schema";
import { requireInternalUser, requireOrganizationMember } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendInvoiceCreatedEmail } from "@/lib/email";
export async function createInvoiceAction(data: {
  organizationId: string,
  projectId?: string,
  retainerPeriodId?: string,
  amount: number, // in dollars
  dueDate: Date
}) {
  const user = await requireInternalUser();

  const [invoice] = await db.insert(invoices).values({
    organizationId: data.organizationId,
    projectId: data.projectId,
    retainerPeriodId: data.retainerPeriodId,
    amount: data.amount * 100, // convert to cents
    dueDate: data.dueDate,
    status: "open"
  }).returning();

  await db.insert(activityLogs).values({
    organizationId: data.organizationId,
    userId: user.id,
    action: "invoice.created",
    entityType: "invoice",
    entityId: invoice.id,
    metadata: JSON.stringify({ amount: data.amount * 100 })
  });

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, data.organizationId)
  });

  // Mock sending to a default org email if available, or just fallback
  if (org) {
    await sendInvoiceCreatedEmail('client@example.com', org.name, invoice.id, data.amount * 100);
  }

  revalidatePath("/crm/billing");
  return invoice;
}

export async function submitManualPaymentDetailsAction(invoiceId: string, utr: string, receiptUrl?: string) {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId)
  });

  if (!invoice) throw new Error("Invoice not found");

  // Verify that the user has permission to access this invoice
  await requireOrganizationMember(invoice.organizationId);

  await db.update(invoices).set({ 
    status: "processing",
    paymentUtr: utr,
    paymentReceiptUrl: receiptUrl
  }).where(eq(invoices.id, invoiceId));

  revalidatePath(`/portal/billing/${invoiceId}`);
  return { success: true };
}

export async function markInvoicePaidManuallyAction(invoiceId: string) {
  await requireInternalUser();

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId)
  });
  if (!invoice) return;

  await db.insert(payments).values({
    invoiceId,
    amount: invoice.amount,
    status: "succeeded",
    provider: "manual",
    paidAt: new Date()
  });

  await db.update(invoices)
    .set({ status: "paid" })
    .where(eq(invoices.id, invoiceId));

  revalidatePath(`/crm/billing/${invoiceId}`);
  revalidatePath(`/crm/billing`);
}
