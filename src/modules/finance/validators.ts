import { z } from "zod";

export const InvoiceStatus = z.enum(["draft", "open", "partially_paid", "paid", "overdue", "cancelled", "voided"]);
export type InvoiceStatusType = z.infer<typeof InvoiceStatus>;

export const PaymentStatus = z.enum(["pending", "verified", "applied", "refunded"]);
export type PaymentStatusType = z.infer<typeof PaymentStatus>;

export function validateInvoiceTransition(current: InvoiceStatusType, next: InvoiceStatusType) {
  const transitions: Record<InvoiceStatusType, InvoiceStatusType[]> = {
    draft: ["open", "voided"],
    open: ["partially_paid", "paid", "overdue", "cancelled", "voided"],
    partially_paid: ["paid", "overdue"], 
    paid: [],
    overdue: ["partially_paid", "paid", "cancelled"],
    cancelled: [],
    voided: [],
  };

  const allowed = transitions[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Illegal invoice state transition from ${current} to ${next}`);
  }
}

export function validatePaymentTransition(current: PaymentStatusType, next: PaymentStatusType) {
  const transitions: Record<PaymentStatusType, PaymentStatusType[]> = {
    pending: ["verified", "refunded"],
    verified: ["applied", "refunded"],
    applied: ["refunded"],
    refunded: [],
  };

  const allowed = transitions[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Illegal payment state transition from ${current} to ${next}`);
  }
}
