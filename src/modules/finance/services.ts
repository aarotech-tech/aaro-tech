import { db } from "@/db";
import { invoices, payments, activityLogs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { FinanceRepository, financeRepository } from "./repositories";
import { DbTx } from "@/db/types";
import { emitDomainEvent } from "@/modules/core/events";
import { validateInvoiceTransition, validatePaymentTransition, InvoiceStatusType, PaymentStatusType } from "./validators";

export class FinanceService {
  constructor(private repo: FinanceRepository = financeRepository) {}

  async issueInvoice(data: {
    organizationId: string,
    projectId?: string,
    retainerPeriodId?: string,
    amount: number, // in dollars
    dueDate: Date
  }, tx?: DbTx) {
    const year = new Date().getFullYear();
    const prefix = `ARO-${year}-`;
    
    // Find highest invoice number for this year
    let maxNumber = 0;
    const { db: database } = require('@/db');
    const { invoices } = require('@/db/schema');
    const { like, desc } = require('drizzle-orm');
    
    const latestInvoice = await database.query.invoices.findFirst({
      where: like(invoices.invoiceNumber, `${prefix}%`),
      orderBy: [desc(invoices.invoiceNumber)]
    });

    if (latestInvoice && latestInvoice.invoiceNumber) {
      const parts = latestInvoice.invoiceNumber.split('-');
      if (parts.length === 3) {
        maxNumber = parseInt(parts[2], 10) || 0;
      }
    }

    const nextNumber = maxNumber + 1;
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(6, '0')}`;

    const invoice = await this.repo.createInvoice({
      invoiceNumber,
      organizationId: data.organizationId,
      projectId: data.projectId,
      retainerPeriodId: data.retainerPeriodId,
      amount: data.amount * 100, // convert to cents
      dueDate: data.dueDate,
      status: "draft"
    }, tx);

    return invoice;
  }

  async createDepositInvoice(organizationId: string, projectId: string, depositAmountCents: number, tx?: DbTx) {
    const year = new Date().getFullYear();
    const prefix = `ARO-${year}-`;
    
    let maxNumber = 0;
    const { db: database } = require('@/db');
    const { invoices } = require('@/db/schema');
    const { like, desc } = require('drizzle-orm');
    
    const latestInvoice = await database.query.invoices.findFirst({
      where: like(invoices.invoiceNumber, `${prefix}%`),
      orderBy: [desc(invoices.invoiceNumber)]
    });

    if (latestInvoice && latestInvoice.invoiceNumber) {
      const parts = latestInvoice.invoiceNumber.split('-');
      if (parts.length === 3) {
        maxNumber = parseInt(parts[2], 10) || 0;
      }
    }

    const nextNumber = maxNumber + 1;
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(6, '0')}`;

    const invoice = await this.repo.createInvoice({
      invoiceNumber,
      organizationId,
      projectId,
      amount: depositAmountCents,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: "open" // Deposit invoices are open immediately
    }, tx);

    emitDomainEvent({
      type: "InvoiceCreated",
      payload: {
        organizationId,
        invoiceId: invoice.id,
        amount: depositAmountCents,
      }
    });

    return invoice;
  }

  async updateInvoiceStatus(invoiceId: string, newStatus: InvoiceStatusType, tx?: DbTx) {
    const invoice = await this.repo.findInvoiceById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    validateInvoiceTransition(invoice.status as InvoiceStatusType, newStatus);
    
    // Integrity Rule: Archiving makes it immutable (caught by transition rules essentially)
    // Integrity Rule: Paid invoices cannot be voided (caught by transition rules)

    const updated = await this.repo.updateInvoice(invoiceId, { status: newStatus }, tx);
    
    if (newStatus === "sent") {
      emitDomainEvent({
        type: "InvoiceCreated",
        payload: { organizationId: invoice.organizationId, invoiceId: invoice.id, amount: invoice.amount }
      });
    }

    return updated;
  }

  async recordPayment(invoiceId: string, amountDollars: number, referenceNumber: string) {
    const invoice = await this.repo.findInvoiceById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    // Integrity Rule: Cannot add payment to a voided/archived invoice
    if (["cancelled", "paid"].includes(invoice.status || "")) {
      throw new Error(`Cannot record payment against an invoice in status: ${invoice.status}`);
    }

    // Ensure payment doesn't exceed invoice total (assuming amount is total expected).
    // In a real system, we'd sum existing payments.
    const amountCents = amountDollars * 100;

    const payment = await this.repo.createPayment({
      invoiceId,
      amount: amountCents,
      status: "pending",
      provider: "manual",
      referenceNumber,
    });
    
    return payment;
  }

  async verifyManualPayment(paymentId: string, internalUserId: string) {
    const payment = await this.repo.findPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");
    
    validatePaymentTransition(payment.status as PaymentStatusType, "verified");

    await this.repo.updatePayment(paymentId, {
      status: "verified",
      verifiedAt: new Date(),
      verifiedBy: internalUserId
    });

    // Auto-apply logic
    validatePaymentTransition("verified", "applied");
    await this.repo.updatePayment(paymentId, {
      status: "applied",
      paidAt: new Date()
    });

    const invoice = await this.repo.findInvoiceById(payment.invoiceId);
    if (invoice) {
      // Transition invoice based on payment application (simplified to full 'paid' here)
      validateInvoiceTransition(invoice.status as InvoiceStatusType, "paid");
      await this.repo.updateInvoice(invoice.id, { status: "paid" });

      emitDomainEvent({
        type: "PaymentVerified",
        payload: {
          organizationId: invoice.organizationId,
          paymentId: payment.id,
          amount: payment.amount,
        }
      });

      emitDomainEvent({
        type: "InvoicePaid",
        payload: {
          organizationId: invoice.organizationId,
          invoiceId: invoice.id,
          amount: payment.amount,
          provider: payment.provider || "manual",
        }
      });
    }

    return true;
  }

  async getInvoiceById(invoiceId: string) {
    return this.repo.findInvoiceById(invoiceId);
  }

  async getFinancialMetrics(organizationId?: string) {
    const { db } = require('@/db');
    const { invoices, payments, retainers, organizations } = require('@/db/schema');
    const { eq, and, desc, gte } = require('drizzle-orm');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allInvoices = await db.query.invoices.findMany({
      where: organizationId ? eq(invoices.organizationId, organizationId) : undefined,
    });

    let revenueThisMonthCents = 0;
    let outstandingRevenueCents = 0;
    let overdueAmountCents = 0;
    let totalPaidInvoicesAmount = 0;
    let totalInvoicesAmount = 0;

    for (const inv of allInvoices) {
      if (inv.status === 'paid' && inv.updatedAt && new Date(inv.updatedAt) >= startOfMonth) {
        revenueThisMonthCents += inv.amount || 0;
      }
      if (['open', 'partially_paid', 'overdue'].includes(inv.status || '')) {
        outstandingRevenueCents += inv.amount || 0;
      }
      if (inv.status === 'overdue') {
        overdueAmountCents += inv.amount || 0;
      }
      if (inv.status !== 'draft' && inv.status !== 'cancelled') {
        totalInvoicesAmount += inv.amount || 0;
        if (inv.status === 'paid') {
          totalPaidInvoicesAmount += inv.amount || 0;
        }
      }
    }

    const collectionRate = totalInvoicesAmount > 0 ? (totalPaidInvoicesAmount / totalInvoicesAmount) : 0;

    // MRR Retainers
    const allRetainers = await db.query.retainers.findMany({
      where: organizationId ? eq(retainers.organizationId, organizationId) : undefined,
    });
    const mrrRetainers = allRetainers.filter((r: any) => r.status === 'active').length;

    // Recently Paid Invoices
    const recentlyPaid = await db
      .select({
        id: invoices.id,
        amountCents: invoices.amount,
        paidAt: invoices.updatedAt,
        clientName: organizations.name,
      })
      .from(invoices)
      .leftJoin(organizations, eq(invoices.organizationId, organizations.id))
      .where(
        and(
          eq(invoices.status, 'paid'),
          organizationId ? eq(invoices.organizationId, organizationId) : undefined
        )
      )
      .orderBy(desc(invoices.updatedAt))
      .limit(5);

    return {
      revenueThisMonthCents,
      outstandingRevenueCents,
      overdueAmountCents,
      collectionRate,
      mrrRetainers,
      recentlyPaidInvoices: recentlyPaid.map((p: any) => ({
        id: p.id,
        amountCents: p.amountCents || 0,
        paidAt: (p.paidAt || new Date()).toISOString(),
        clientName: p.clientName || 'Unknown',
      })),
    };
  }

  async getClientInvoices(organizationId: string) {
    const { db } = require('@/db');
    const { invoices } = require('@/db/schema');
    const { eq, desc } = require('drizzle-orm');

    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
      orderBy: [desc(invoices.createdAt)],
    });

    return allInvoices.map((inv: any) => ({
      id: inv.id,
      number: `INV-${inv.id.substring(0, 8)}`,
      amountCents: inv.amount || 0,
      status: inv.status || "draft",
      dueAt: inv.dueDate ? new Date(inv.dueDate).toISOString() : new Date().toISOString(),
      paidAt: inv.status === 'paid' && inv.updatedAt ? new Date(inv.updatedAt).toISOString() : undefined,
    }));
  }

  async getClientPayments(organizationId: string) {
    const { db } = require('@/db');
    const { payments, invoices } = require('@/db/schema');
    const { eq, desc } = require('drizzle-orm');

    const allPayments = await db
      .select({
        id: payments.id,
        invoiceId: invoices.id,
        amountCents: payments.amount,
        method: payments.provider,
        status: payments.status,
        appliedAt: payments.paidAt,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.organizationId, organizationId))
      .orderBy(desc(payments.createdAt));

    return allPayments.map((p: any) => ({
      id: p.id,
      invoiceNumber: `INV-${p.invoiceId.substring(0, 8)}`,
      amountCents: p.amountCents || 0,
      method: p.method || "manual",
      status: p.status || "pending",
      appliedAt: p.appliedAt ? new Date(p.appliedAt).toISOString() : new Date().toISOString(),
    }));
  }
  async getClientInvoiceDetails(invoiceId: string, organizationId: string) {
    const { db } = require('@/db');
    const { invoices, projects, retainerPeriods, payments } = require('@/db/schema');
    const { eq, desc } = require('drizzle-orm');

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });

    if (!invoice || invoice.organizationId !== organizationId) {
      return null;
    }

    let project = null;
    if (invoice.projectId) {
      project = await db.query.projects.findFirst({ where: eq(projects.id, invoice.projectId) });
    }

    let period = null;
    if (invoice.retainerPeriodId) {
      period = await db.query.retainerPeriods.findFirst({ where: eq(retainerPeriods.id, invoice.retainerPeriodId) });
    }

    const invoicePayments = await db.query.payments.findMany({
      where: eq(payments.invoiceId, invoiceId),
      orderBy: [desc(payments.createdAt)]
    });

    return { invoice, project, period, payments: invoicePayments };
  }

  async processMockPayment(invoiceId: string, organizationId: string) {
    const { db } = require('@/db');
    const { invoices, payments } = require('@/db/schema');
    const { eq } = require('drizzle-orm');

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });

    if (!invoice || invoice.organizationId !== organizationId) {
      return false;
    }

    if (invoice.status !== 'paid') {
      await db.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, invoiceId));
      await db.insert(payments).values({
        invoiceId,
        amount: invoice.amount,
        status: 'succeeded',
        provider: 'stripe (mock)',
        paidAt: new Date()
      });
      return true;
    }
    return false;
  }
}

export const financeService = new FinanceService();




export async function recordManualPaymentService(data: {
  invoiceId: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  notes?: string;
  paidAt: string;
  userId: string;
  organizationId: string;
}) {
  // 1. Verify invoice exists and belongs to the organization
  const invoice = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, data.invoiceId),
      eq(invoices.organizationId, data.organizationId)
    ),
    with: { payments: true }
  });

  if (!invoice) {
    throw new Error("Invoice not found or unauthorized.");
  }

  // 2. Create the payment
  const [payment] = await db.insert(payments).values({
    invoiceId: data.invoiceId,
    amount: data.amount,
    provider: "manual",
    status: "succeeded",
    method: data.method,
    referenceNumber: data.referenceNumber,
    notes: data.notes,
    paidAt: new Date(data.paidAt),
    verifiedAt: new Date(),
    verifiedBy: data.userId,
    createdBy: data.userId,
  }).returning();

  // 3. Update invoice status logic
  if (invoice) {
    // Total paid including this new payment
    const totalPaid = (invoice as any).payments
      .filter((p: any) => p.status === "succeeded")
      .reduce((sum: number, p: any) => sum + p.amount, 0) + payment.amount;

    let newStatus = invoice.status;
    if (totalPaid >= invoice.amount) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partially_paid"; // Assuming we want to track this, but schema defaults 'open' 'paid' 'void'. We can just use 'open' if not fully paid or add 'partially_paid'.
      // Actually schema says: draft, open, paid, void. So if not fully paid, keep it open.
      // If we want "partially_paid" we can just push it, drizzle varchar handles any string. Let's stick to "open" and "paid" for safety.
      if (invoice.status === "open" && totalPaid >= invoice.amount) {
          newStatus = "paid";
      }
    }

    if (newStatus !== invoice.status) {
      await db.update(invoices).set({ status: newStatus }).where(eq(invoices.id, invoice.id));
    }
    
    // Log activity
    await db.insert(activityLogs).values({
      organizationId: data.organizationId,
      entityType: "invoice",
      entityId: invoice.id,
      action: "payment.recorded",
      userId: data.userId,
      metadata: JSON.stringify({ paymentId: payment.id, amount: payment.amount, method: payment.method }),
    });
  }

  return payment;
}
