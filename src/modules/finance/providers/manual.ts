import { PaymentProvider } from "./index";
import { randomUUID } from "crypto";

export class ManualPaymentProvider implements PaymentProvider {
  name = "manual";

  async createPaymentIntent(invoice: any, amount: number) {
    // For manual payments, we just generate a unique string to act as the ID
    const providerPaymentId = `manual_` + randomUUID();
    return { providerPaymentId };
  }

  async verifyPayment(providerPaymentId: string, payload: any) {
    // Manual payments are verified via administrative action (manual override)
    // Here we can just assume if they call verify, it's true, 
    // or validate a secret if we wanted. But admin verify is trusted.
    return true;
  }

  async refundPayment(providerPaymentId: string, amount: number) {
    // Manual refunds require manual processing outside the system, so we just return true
    // as an acknowledgment of the record.
    return true;
  }
}

export const manualPaymentProvider = new ManualPaymentProvider();
