"use server";

import { revalidatePath } from "next/cache";
import { internalActionClient, tenantActionClient } from "@/lib/safe-action";
import { z } from "zod";
import * as FinanceService from "@/modules/finance/services";

// ------------- INVOICES ------------- //

const createInvoiceSchema = z.object({
  organizationId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  amount: z.number().positive(),
  dueDate: z.string(),
  notes: z.string().optional(),
});
export const createInvoiceAction = internalActionClient
  .schema(createInvoiceSchema)
  .action(async ({ parsedInput }) => {
    const result = await FinanceService.financeService.issueInvoice({
      ...parsedInput,
      dueDate: new Date(parsedInput.dueDate),
    });
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, invoiceId: result.id };
  });

// ------------- RETAINERS ------------- //

const createRetainerSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  amount: z.number().positive(),
  billingDay: z.number().min(1).max(28),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export const createRetainerAction = internalActionClient
  .schema(createRetainerSchema)
  .action(async ({ parsedInput, ctx }) => {
    const data = {
      ...parsedInput,
      startDate: new Date(parsedInput.startDate),
      endDate: parsedInput.endDate ? new Date(parsedInput.endDate) : undefined,
    };
    const result = await FinanceService.financeService.createRetainer(data, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

const updateRetainerStatusSchema = z.object({
  retainerId: z.string().uuid(),
  status: z.enum(["active", "paused", "cancelled"]),
});

export const updateRetainerStatusAction = internalActionClient
  .schema(updateRetainerStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await FinanceService.financeService.updateRetainerStatus(parsedInput.retainerId, parsedInput.status, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

const updateInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  organizationId: z.string().uuid(),
  subTotal: z.number().nonnegative(),
  gstAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  dueDate: z.string(),
  notes: z.string().optional(),
});
export const updateInvoiceAction = internalActionClient
  .schema(updateInvoiceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { invoiceId, organizationId, ...data } = parsedInput;
    const result = await FinanceService.financeService.updateInvoice(invoiceId, organizationId, data, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

const voidInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  organizationId: z.string().uuid(),
});
export const voidInvoiceAction = internalActionClient
  .schema(voidInvoiceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await FinanceService.financeService.voidInvoice(parsedInput.invoiceId, parsedInput.organizationId, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

const cancelInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  organizationId: z.string().uuid(),
});
export const cancelInvoiceAction = internalActionClient
  .schema(cancelInvoiceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await FinanceService.financeService.cancelInvoice(parsedInput.invoiceId, parsedInput.organizationId, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

// ------------- PAYMENTS ------------- //

const recordManualPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  amount: z.number().positive(),
  method: z.string(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.union([z.string(), z.date()]).transform(v => new Date(v).toISOString()),
  attachments: z.any().optional(), // UploadThing result
});
export const recordManualPaymentAction = tenantActionClient
  .schema(recordManualPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    let orgId = (ctx as any).orgId;
    if (parsedInput.organizationId && parsedInput.organizationId !== orgId) {
      // If they supply a different orgId, we MUST verify they are a member of it.
      // (Internal users will pass this check automatically).
      const { requireOrganizationMember } = await import("@/lib/auth");
      await requireOrganizationMember(parsedInput.organizationId);
      orgId = parsedInput.organizationId;
    }

    const result = await FinanceService.financeService.recordManualPayment({
      ...parsedInput,
      organizationId: orgId,
      userId: (ctx as any).userId || (ctx as any).user?.id,
    });
    revalidatePath("/(client)/portal/billing/[invoiceId]", "page");
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, paymentId: result.id };
  });

const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  status: z.string().optional(),
});
export const verifyPaymentAction = internalActionClient
  .schema(verifyPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const orgId = parsedInput.organizationId || (ctx as any).orgId || "";
    // Note: The previous signature accepted "status: 'verified'"
    const result = await FinanceService.financeService.verifyManualPayment(parsedInput.paymentId, orgId, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });

const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
});
export const rejectPaymentAction = internalActionClient
  .schema(rejectPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const orgId = parsedInput.organizationId || (ctx as any).orgId || "";
    const result = await FinanceService.financeService.rejectManualPayment(parsedInput.paymentId, orgId, ctx.user.id);
    revalidatePath("/(admin)/finance", "layout");
    return { success: true, result };
  });
