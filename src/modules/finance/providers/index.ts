export interface PaymentProvider {
  name: string;
  createPaymentIntent(invoice: any, amount: number): Promise<{ providerPaymentId: string; clientSecret?: string }>;
  verifyPayment(providerPaymentId: string, payload: any): Promise<boolean>;
  refundPayment(providerPaymentId: string, amount: number): Promise<boolean>;
}
