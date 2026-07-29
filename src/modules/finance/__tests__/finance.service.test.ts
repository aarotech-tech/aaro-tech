import { describe, it, expect, vi, beforeEach } from 'vitest';
import { financeService } from '../services';
import { db } from '@/db';
import { manualPaymentProvider } from '../providers/manual';
import { emitDomainEvent } from '@/modules/core/events';

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    query: {
      payments: { findFirst: vi.fn(), findMany: vi.fn() },
      invoices: { findFirst: vi.fn(), findMany: vi.fn() }
    },
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    transaction: vi.fn(async (cb) => {
      // Create a mock transaction object that matches the db interface we use
      const tx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "payment-123", status: "succeeded" }]),
        query: {
          payments: {
            findMany: vi.fn().mockResolvedValue([{ amount: 1000, status: "succeeded" }])
          }
        }
      };
      return cb(tx);
    })
  }
}));

vi.mock('../providers/manual', () => ({
  manualPaymentProvider: {
    createPaymentIntent: vi.fn().mockResolvedValue({ providerPaymentId: 'mock-intent' }),
    verifyPayment: vi.fn(),
    name: 'manual'
  }
}));

vi.mock('@/modules/core/events', () => ({
  emitDomainEvent: vi.fn()
}));

// Mock FinanceRepository methods
financeService["repo"].findPaymentById = vi.fn();
financeService["repo"].updatePayment = vi.fn().mockResolvedValue([{ id: "payment-123", status: "succeeded" }]);
financeService["repo"].updateInvoice = vi.fn().mockResolvedValue([{ id: "invoice-123" }]);

describe('FinanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyManualPayment', () => {
    it('should reject if payment is not found', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValueOnce(null);

      await expect(financeService.verifyManualPayment('invalid-id', 'org-1', 'user-1'))
        .rejects.toThrow("Payment not found");
    });

    it('should reject if payment belongs to different organization', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValueOnce({
        id: 'payment-1',
        invoice: { organizationId: 'different-org' }
      } as any);

      await expect(financeService.verifyManualPayment('payment-1', 'org-1', 'user-1'))
        .rejects.toThrow("Payment not found");
    });

    it('should reject invalid state transitions (e.g. verifying an already succeeded payment)', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValueOnce({
        id: 'payment-1',
        status: 'succeeded',
        invoice: { organizationId: 'org-1' }
      } as any);

      await expect(financeService.verifyManualPayment('payment-1', 'org-1', 'user-1'))
        .rejects.toThrow("Only pending payments can be verified.");
    });

    it('should rollback transaction and throw if verification fails by provider', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValueOnce({
        id: 'payment-1',
        status: 'pending',
        providerPaymentId: 'prov-id',
        invoice: { organizationId: 'org-1' }
      } as any);

      vi.mocked(manualPaymentProvider.verifyPayment).mockResolvedValueOnce(false);

      await expect(financeService.verifyManualPayment('payment-1', 'org-1', 'user-1'))
        .rejects.toThrow("Verification failed by provider");
        
      expect(db.transaction).not.toHaveBeenCalled();
      expect(emitDomainEvent).not.toHaveBeenCalled();
    });

    it('should execute atomical verification and outbox event creation successfully', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValueOnce({
        id: 'payment-1',
        status: 'pending',
        amount: 1000,
        providerPaymentId: 'prov-id',
        invoice: { id: 'inv-1', organizationId: 'org-1', amount: 1000, status: 'open' }
      } as any);

      vi.mocked(manualPaymentProvider.verifyPayment).mockResolvedValueOnce(true);

      const result = await financeService.verifyManualPayment('payment-1', 'org-1', 'user-1');

      expect(manualPaymentProvider.verifyPayment).toHaveBeenCalledWith('prov-id', null);
      expect(db.transaction).toHaveBeenCalled();
      
      // Verification emits both PaymentVerified and InvoicePaid if total paid == invoice amount
      expect(emitDomainEvent).toHaveBeenCalledTimes(2);
      expect(emitDomainEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: "PaymentVerified" }), expect.anything());
      expect(emitDomainEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: "InvoicePaid" }), expect.anything());
      
      expect(result).toHaveProperty('status', 'succeeded');
    });
  });

  describe('voidInvoice', () => {
    it('should reject invalid state transitions (voiding an already paid invoice)', async () => {
      financeService["repo"].findInvoiceById = vi.fn().mockResolvedValueOnce({
        id: 'inv-1',
        organizationId: 'org-1',
        status: 'paid'
      });

      await expect(financeService.voidInvoice('inv-1', 'org-1', 'user-1'))
        .rejects.toThrow("Cannot void a paid or already voided invoice.");
    });
  });
});
