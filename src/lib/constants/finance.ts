export const INVOICE_STATUSES = [
  { id: "draft", label: "Draft", order: 1 },
  { id: "open", label: "Open", order: 2 },
  { id: "partially_paid", label: "Partially Paid", order: 3 },
  { id: "paid", label: "Paid", order: 4 },
  { id: "overdue", label: "Overdue", order: 5 },
  { id: "cancelled", label: "Cancelled", order: 6 },
] as const;

export type InvoiceStatusId = typeof INVOICE_STATUSES[number]["id"];

export const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "upi", label: "UPI" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Other" },
] as const;

export type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"];

export const PAYMENT_STATUSES = [
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "failed", label: "Failed" },
] as const;

export type PaymentStatusId = typeof PAYMENT_STATUSES[number]["id"];
