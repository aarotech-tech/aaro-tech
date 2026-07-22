"use server";

import { db } from "@/db";
import { invoices, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";
import { createInvoiceSchema, recordManualPaymentSchema, verifyPaymentSchema, CreateInvoiceInput, RecordManualPaymentInput, VerifyPaymentInput } from "@/lib/validations/finance";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { internalActionClient, tenantActionClient } from "@/lib/safe-action";
import { financeService } from "@/modules/finance/services";

export const createInvoiceAction = internalActionClient
  .schema(createInvoiceSchema)
  .action(async ({ parsedInput }) => {
    const newInvoice = await financeService.issueInvoice({
      organizationId: parsedInput.organizationId,
      projectId: parsedInput.projectId,
      amount: parsedInput.amount,
      dueDate: parsedInput.dueDate,
    });

    revalidatePath("/(admin)/finance", "layout");
    return { success: true, invoiceId: newInvoice.id };
  });

export const recordManualPaymentAction = tenantActionClient
  .schema(recordManualPaymentSchema)
  .action(async ({ parsedInput }) => {
    const newPayment = await financeService.recordPayment(
      parsedInput.invoiceId, 
      parsedInput.amount, 
      parsedInput.referenceNumber || ""
    );

    revalidatePath("/(client)/portal/billing/[invoiceId]", "page");
    return { success: true, paymentId: newPayment.id };
  });

export const verifyPaymentAction = internalActionClient
  .schema(verifyPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.status === "verified") {
      await financeService.verifyManualPayment(parsedInput.paymentId, ctx.user.id);
    } else {
      throw new Error("Only verification is supported via this endpoint currently.");
    }

    revalidatePath("/(admin)/finance", "layout");
    revalidatePath("/(client)/portal/billing/[invoiceId]", "page");
    return { success: true };
  });
