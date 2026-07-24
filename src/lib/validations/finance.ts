import { z } from "zod";
import { INVOICE_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../constants/finance";

export const createInvoiceSchema = z.object({
  organizationId: z.string().uuid("Invalid Organization ID"),
  projectId: z.string().uuid("Invalid Project ID").optional(),
  amount: z.number().positive("Amount must be positive"), // in cents
  dueDate: z.union([z.string(), z.date()]).transform(v => new Date(v)),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const recordManualPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid Invoice ID"),
  organizationId: z.string().uuid("Invalid Org ID").optional(),
  amount: z.number().positive("Amount must be positive"),
  method: z.string().refine((val) => PAYMENT_METHODS.some((s) => s.id === val), {
    message: "Invalid payment method",
  }),
  referenceNumber: z.string().optional(),
  paidAt: z.union([z.string(), z.date()]).transform(v => new Date(v)),
  notes: z.string().optional(),
  attachments: z.any().optional(),
});

export type RecordManualPaymentInput = z.infer<typeof recordManualPaymentSchema>;

export const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid Payment ID"),
  status: z.enum(["verified", "failed"]),
  notes: z.string().optional(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
