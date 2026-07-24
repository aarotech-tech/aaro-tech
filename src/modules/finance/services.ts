import { db, db as database } from "@/db";
import { invoices, payments, activityLogs, retainers, organizations, projects, retainerPeriods } from "@/db/schema";
import { eq, desc, and, like, gte } from "drizzle-orm";
import { FinanceRepository, financeRepository } from "./repositories";
import { DbTx } from "@/db/types";
import { emitDomainEvent } from "@/modules/core/events";
import { validateInvoiceTransition, validatePaymentTransition, InvoiceStatusType, PaymentStatusType } from "./validators";
import { manualPaymentProvider } from "./providers/manual";

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
    
    if (newStatus === "open") {
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allInvoices = await db.query.invoices.findMany({
      where: organizationId ? eq(invoices.organizationId, organizationId) : undefined,
    });

    let revenueThisMonthCents = 0;
    let outstandingRevenueCents = 0;
    let overdueAmountCents = 0;
    let overdueInvoicesCount = 0;
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
        overdueInvoicesCount += 1;
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
      overdueInvoicesCount,
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

}
export const financeService = new FinanceService();

export async function updateInvoiceService(invoiceId: string, organizationId: string, data: { subTotal: number, gstAmount: number, discountAmount: number, dueDate: string, notes?: string }, userId: string) {
  const invoice = await db.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)) });
  if (!invoice) throw new Error("Invoice not found");

  const totalAmount = data.subTotal + data.gstAmount - data.discountAmount;
  
  const [updated] = await db.update(invoices).set({
    subTotal: data.subTotal,
    gstAmount: data.gstAmount,
    discountAmount: data.discountAmount,
    amount: totalAmount,
    dueDate: new Date(data.dueDate),
    notes: data.notes,
    updatedAt: new Date(),
    updatedBy: userId
  }).where(eq(invoices.id, invoiceId)).returning();

  return updated;
}

export async function voidInvoiceService(invoiceId: string, organizationId: string, userId: string) {
  const invoice = await db.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)) });
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.status === "paid" || invoice.status === "voided") throw new Error("Cannot void a paid or already voided invoice.");

  const [updated] = await db.update(invoices).set({
    status: "voided",
    updatedAt: new Date(),
    updatedBy: userId
  }).where(eq(invoices.id, invoiceId)).returning();

  return updated;
}

export async function cancelInvoiceService(invoiceId: string, organizationId: string, userId: string) {
  const invoice = await db.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)) });
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.status === "paid" || invoice.status === "cancelled") throw new Error("Cannot cancel a paid or already cancelled invoice.");

  const [updated] = await db.update(invoices).set({
    status: "cancelled",
    updatedAt: new Date(),
    updatedBy: userId
  }).where(eq(invoices.id, invoiceId)).returning();

  return updated;
}export async function recordManualPaymentService(data: {
  invoiceId: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  notes?: string;
  paidAt: string;
  userId: string;
  organizationId: string;
  attachments?: any;
}) {
  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, data.invoiceId), eq(invoices.organizationId, data.organizationId)),
    with: { payments: true }
  });

  if (!invoice) throw new Error("Invoice not found or unauthorized.");

  // Use the Manual Payment Provider
  const { providerPaymentId } = await manualPaymentProvider.createPaymentIntent(invoice, data.amount);

  const [payment] = await db.insert(payments).values({
    invoiceId: data.invoiceId,
    amount: data.amount,
    provider: manualPaymentProvider.name,
    providerPaymentId,
    status: "pending", // Record as pending until verified
    method: data.method,
    referenceNumber: data.referenceNumber,
    notes: data.notes,
    attachments: data.attachments || null,
    paidAt: new Date(data.paidAt),
    createdBy: data.userId,
  }).returning();

  return payment;
}

export async function verifyManualPaymentService(paymentId: string, organizationId: string, userId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: { invoice: true }
  });
  
  if (!payment || !payment.invoice || payment.invoice.organizationId !== organizationId) {
    throw new Error("Payment not found");
  }

  const isValid = await manualPaymentProvider.verifyPayment(payment.providerPaymentId!, null);
  if (!isValid) throw new Error("Verification failed by provider");

  const [updatedPayment] = await db.update(payments).set({
    status: "succeeded",
    verifiedAt: new Date(),
    verifiedBy: userId,
    updatedAt: new Date(),
    updatedBy: userId
  }).where(eq(payments.id, paymentId)).returning();

  // Recalculate invoice status
  const allPayments = await db.query.payments.findMany({ where: eq(payments.invoiceId, payment.invoiceId) });
  const totalPaid = allPayments.filter(p => p.status === "succeeded").reduce((acc, p) => acc + p.amount, 0);

  let newStatus = payment.invoice.status;
  if (totalPaid >= payment.invoice.amount) {
    newStatus = "paid";
  } else if (totalPaid > 0) {
    newStatus = "partially_paid";
  }

  if (newStatus !== payment.invoice.status) {
    await db.update(invoices).set({ status: newStatus }).where(eq(invoices.id, payment.invoiceId));
  }

  return updatedPayment;
}

export async function rejectManualPaymentService(paymentId: string, organizationId: string, userId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: { invoice: true }
  });
  
  if (!payment || !payment.invoice || payment.invoice.organizationId !== organizationId) {
    throw new Error("Payment not found");
  }

  const [updatedPayment] = await db.update(payments).set({
    status: "failed",
    updatedAt: new Date(),
    updatedBy: userId
  }).where(eq(payments.id, paymentId)).returning();

  return updatedPayment;
}

export async function getFinanceDashboardMetricsService(organizationId: string) {

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.organizationId, organizationId),
    with: { payments: true }
  });

  let revenueThisMonthCents = 0;
  let outstandingRevenueCents = 0;
  let collectionAmountThisMonth = 0;
  
  // Payment methods breakdown
  const methodMap: Record<string, number> = {};

  for (const inv of allInvoices) {
    const isPaid = inv.status === 'paid';
    if (isPaid && inv.updatedAt && new Date(inv.updatedAt) >= startOfMonth) {
      revenueThisMonthCents += inv.amount || 0;
    }
    
    if (['open', 'partially_paid', 'overdue'].includes(inv.status || '')) {
      const paidSoFar = inv.payments.filter((p: any) => p.status === "succeeded").reduce((acc: number, p: any) => acc + p.amount, 0);
      outstandingRevenueCents += (inv.amount - paidSoFar);
    }

    // Collections based on successful payments in month
    for (const p of inv.payments) {
      if (p.status === "succeeded" && p.verifiedAt && new Date(p.verifiedAt) >= startOfMonth) {
        collectionAmountThisMonth += p.amount;
      }
      if (p.status === "succeeded") {
        methodMap[p.method || 'unknown'] = (methodMap[p.method || 'unknown'] || 0) + p.amount;
      }
    }
  }

  // Monthly Revenue Data (real aggregation)
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    
    let monthRevenue = 0;
    for (const inv of allInvoices) {
      for (const p of inv.payments) {
        if (p.status === "succeeded" && p.verifiedAt) {
          const paidDate = new Date(p.verifiedAt);
          if (paidDate >= monthStart && paidDate <= monthEnd) {
            monthRevenue += p.amount;
          }
        }
      }
    }

    monthlyRevenue.push({
      month: monthStart.toLocaleString('default', { month: 'short' }),
      revenue: Math.floor(monthRevenue / 100)
    });
  }

  // Aging Report
  const agingReport = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0
  };

  const gstSummary = allInvoices.reduce((acc: number, inv: any) => acc + (inv.gstAmount || 0), 0);

  return {
    revenueThisMonthCents,
    outstandingRevenueCents,
    collectionAmountThisMonth,
    monthlyRevenue,
    agingReport,
    gstSummary,
    paymentMethods: Object.entries(methodMap).map(([method, amount]) => ({ method, amount }))
  };
}

