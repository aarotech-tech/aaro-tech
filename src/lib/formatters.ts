export function formatCurrency(amountCents: number, options?: Intl.NumberFormatOptions): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "INR",
    ...options,
  };
  return new Intl.NumberFormat("en-IN", defaultOptions).format(amountCents / 100);
}
