"use server";

import { financeService } from "./services";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// unused imports removed
import { internalActionClient } from "@/lib/safe-action";

export const recordPaymentAction = internalActionClient
  .schema(z.object({
    invoiceId: z.string().uuid(),
    amount: z.number().positive(),
    referenceNumber: z.string().min(1),
  }))
  .action(async ({ parsedInput: { invoiceId, amount, referenceNumber }, ctx }) => {
    try {
      const payment = await financeService.recordPayment(invoiceId, amount, referenceNumber);
      
      revalidatePath("/finance/payments");
      revalidatePath("/finance/invoices");
      
      return { success: true, paymentId: payment.id };
    } catch (e: any) {
      return { serverError: e.message || "Failed to record payment" };
    }
  });

export const verifyManualPaymentAction = internalActionClient
  .schema(z.object({
    paymentId: z.string().uuid(),
  }))
  .action(async ({ parsedInput: { paymentId }, ctx }) => {
    try {
      await financeService.verifyManualPayment(paymentId, ctx.user.id);
      
      revalidatePath("/finance/payments");
      revalidatePath("/finance/invoices");
      
      return { success: true };
    } catch (e: any) {
      return { serverError: e.message || "Failed to verify payment" };
    }
  });


import * as FinanceService from "./services";

const recordManualPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().min(1),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string(),
});

export const recordManualPaymentAction = internalActionClient
  .schema(recordManualPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await FinanceService.recordManualPaymentService({
      invoiceId: parsedInput.invoiceId,
      amount: parsedInput.amount,
      method: parsedInput.method,
      referenceNumber: parsedInput.referenceNumber,
      notes: parsedInput.notes,
      paidAt: parsedInput.paidAt,
      userId: ctx.user.id,
      organizationId: parsedInput.organizationId,
    });
    
    revalidatePath(`/projects/${parsedInput.projectId}/finance`);
    revalidatePath(`/portal/projects/${parsedInput.projectId}`);
    return result;
  });
