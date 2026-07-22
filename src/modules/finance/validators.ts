import { z } from "zod";

export const InvoiceStatus = z.enum(["draft", "issued", "sent", "viewed", "partially_paid", "paid", "archived", "voided"]);
export type InvoiceStatusType = z.infer<typeof InvoiceStatus>;

export const PaymentStatus = z.enum(["pending", "verified", "applied", "refunded"]);
export type PaymentStatusType = z.infer<typeof PaymentStatus>;

export function validateInvoiceTransition(current: InvoiceStatusType, next: InvoiceStatusType) {
  const transitions: Record<InvoiceStatusType, InvoiceStatusType[]> = {
    draft: ["issued", "voided"],
    issued: ["sent", "voided", "paid", "partially_paid"], // e.g. paid physically without sending
    sent: ["viewed", "voided", "paid", "partially_paid"],
    viewed: ["partially_paid", "paid", "voided"],
    partially_paid: ["paid"], // Cannot void after payment received
    paid: ["archived"],
    archived: [],
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
