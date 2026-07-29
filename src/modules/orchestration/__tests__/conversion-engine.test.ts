import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversionEngine } from '../conversion-engine';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    query: {
      deals: { findFirst: vi.fn() },
      projects: { findFirst: vi.fn() }
    },
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "proj-123" }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    transaction: vi.fn(async (cb) => {
      const tx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "mock-1" }]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis()
      };
      return cb(tx);
    })
  }
}));

vi.mock('@/modules/finance/services', () => ({
  financeService: {
    createDepositInvoice: vi.fn().mockResolvedValue({ id: 'inv-123' }),
    updateInvoiceStatus: vi.fn(),
    getInvoiceById: vi.fn().mockResolvedValue({ id: 'inv-123', projectId: 'proj-123' })
  }
}));

vi.mock('@/modules/delivery/services', () => ({
  createProjectFromDeal: vi.fn().mockResolvedValue({ id: 'proj-123', status: 'pending' }),
  activateProject: vi.fn().mockResolvedValue({ id: 'proj-123', status: 'active' })
}));

describe('ConversionEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleProposalAccepted', () => {
    it('should return skipped true if project already exists (Idempotency check)', async () => {
      // Mock that project already exists for this deal
      vi.mocked(db.query.projects.findFirst).mockResolvedValueOnce({
        id: 'existing-proj-1',
        dealId: 'deal-1'
      } as any);

      const res = await conversionEngine.handleProposalAccepted('deal-1', 'org-1');
      
      expect(res).toEqual({ project: { id: 'existing-proj-1', dealId: 'deal-1' }, skipped: true });
      expect(db.query.projects.findFirst).toHaveBeenCalled();
    });
  });

  describe('handleInvoicePaid', () => {
    it('should silently return if project is already active (Idempotency check)', async () => {
      // Return a project that is already active
      vi.mocked(db.query.projects.findFirst).mockResolvedValueOnce({
        id: 'proj-1',
        status: 'active'
      } as any);

      await conversionEngine.handleInvoicePaid('inv-1', 'org-1');
      // No exception, just returns void
    });

    it('should successfully activate project if pending', async () => {
      const { activateProject } = await import('@/modules/delivery/services');
      
      // Return a pending project
      vi.mocked(db.query.projects.findFirst).mockResolvedValueOnce({
        id: 'proj-123',
        status: 'pending',
        organizationId: 'org-1'
      } as any);

      await conversionEngine.handleInvoicePaid('inv-1', 'org-1');

      expect(activateProject).toHaveBeenCalledWith('proj-123', 'org-1');
    });
  });
});
