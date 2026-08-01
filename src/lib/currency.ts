/**
 * Converts Rupees (e.g. 10.50) to Paise (e.g. 1050).
 * Handles floating point precision issues.
 */
export function toPaise(rupees: number): number {
  if (rupees === undefined || rupees === null || isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts Paise (e.g. 1050) to Rupees (e.g. 10.50).
 */
export function toRupees(paise: number): number {
  if (paise === undefined || paise === null || isNaN(paise)) return 0;
  return paise / 100;
}

/**
 * Formats a Paise amount into an INR string (e.g. ₹10.50).
 */
export function formatPaiseToINR(paise: number): string {
  const rupees = toRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
