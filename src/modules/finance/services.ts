import { db, db as database } from "@/db";
import { invoices, payments, activityLogs, retainers, organizations, projects, retainerPeriods } from "@/db/schema";
import { eq, desc, and, like, gte } from "drizzle-orm";
import { FinanceRepository, financeRepository } from "./repositories";
import { DbTx } from "@/db/types";
import { emitDomainEvent } from "@/modules/core/events";
import { validateInvoiceTransition, validatePaymentTransition, InvoiceStatusType, PaymentStatusType } from "./validators";
import { manualPaymentProvider } from "./providers/manual";
import { toPaise } from "@/lib/currency";

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
      amount: toPaise(data.amount), // convert to cents
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

    // Fire and forget event
    emitDomainEvent({
      type: "InvoiceViewed",
      payload: {
        organizationId: invoice.organizationId,
        invoiceId: invoice.id,
      }
    }).catch(console.error);

    return { invoice, project, period, payments: invoicePayments };
  }

  async updateInvoice(invoiceId: string, organizationId: string, data: { subTotal: number, gstAmount: number, discountAmount: number, dueDate: string, notes?: string }, userId: string) {
    const invoice = await this.repo.findInvoiceById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) throw new Error("Invoice not found");

    const totalAmount = data.subTotal + data.gstAmount - data.discountAmount;
    
    const [updated] = await this.repo.updateInvoice(invoiceId, {
      subTotal: data.subTotal,
      gstAmount: data.gstAmount,
      discountAmount: data.discountAmount,
      amount: totalAmount,
      dueDate: new Date(data.dueDate),
      notes: data.notes,
      updatedAt: new Date(),
      updatedBy: userId
    });

    return updated;
  }

  async voidInvoice(invoiceId: string, organizationId: string, userId: string) {
    const invoice = await this.repo.findInvoiceById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) throw new Error("Invoice not found");

    if (invoice.status === "paid" || invoice.status === "voided") throw new Error("Cannot void a paid or already voided invoice.");

    const [updated] = await this.repo.updateInvoice(invoiceId, {
      status: "voided",
      updatedAt: new Date(),
      updatedBy: userId
    });

    return updated;
  }

  async cancelInvoice(invoiceId: string, organizationId: string, userId: string) {
    const invoice = await this.repo.findInvoiceById(invoiceId);
    if (!invoice || invoice.organizationId !== organizationId) throw new Error("Invoice not found");

    if (invoice.status === "paid" || invoice.status === "cancelled") throw new Error("Cannot cancel a paid or already cancelled invoice.");

    const [updated] = await this.repo.updateInvoice(invoiceId, {
      status: "cancelled",
      updatedAt: new Date(),
      updatedBy: userId
    });

    return updated;
  }

  async recordManualPayment(data: {
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

    const { providerPaymentId } = await manualPaymentProvider.createPaymentIntent(invoice, data.amount);

    const payment = await this.repo.createPayment({
      invoiceId: data.invoiceId,
      amount: data.amount,
      provider: manualPaymentProvider.name,
      providerPaymentId,
      status: "pending",
      method: data.method,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      attachments: data.attachments || null,
      paidAt: new Date(data.paidAt),
      createdBy: data.userId,
    });

    return payment;
  }

  async verifyManualPayment(paymentId: string, organizationId: string, userId: string) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
      with: { invoice: true }
    });
    
    if (!payment || !payment.invoice || payment.invoice.organizationId !== organizationId) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new Error("Only pending payments can be verified.");
    }

    const isValid = await manualPaymentProvider.verifyPayment(payment.providerPaymentId!, null);
    if (!isValid) throw new Error("Verification failed by provider");

    const updatedPayment = await db.transaction(async (tx) => {
      const [updated] = await this.repo.updatePayment(paymentId, {
        status: "succeeded",
        verifiedAt: new Date(),
        verifiedBy: userId,
        updatedAt: new Date(),
        updatedBy: userId
      }, tx);

      const allPayments = await tx.query.payments.findMany({ where: eq(payments.invoiceId, payment.invoiceId) });
      const totalPaid = allPayments.filter((p: any) => p.status === "succeeded").reduce((acc: number, p: any) => acc + p.amount, 0);

      let newStatus = payment.invoice.status;
      if (totalPaid >= payment.invoice.amount) {
        newStatus = "paid";
      } else if (totalPaid > 0) {
        newStatus = "partially_paid";
      }

      if (newStatus !== payment.invoice.status) {
        await this.repo.updateInvoice(payment.invoiceId, { status: newStatus as any }, tx);
      }

      await emitDomainEvent({
        type: "PaymentVerified",
        payload: {
          organizationId: payment.invoice.organizationId,
          paymentId: payment.id,
          amount: payment.amount,
          userId,
        }
      }, tx);

      if (newStatus === "paid" && payment.invoice.status !== "paid") {
        await emitDomainEvent({
          type: "InvoicePaid",
          payload: {
            organizationId: payment.invoice.organizationId,
            invoiceId: payment.invoice.id,
            amount: payment.invoice.amount,
            provider: payment.provider || "manual",
            userId,
          }
        }, tx);
      }

      return updated;
    });

    return updatedPayment;
  }

  async rejectManualPayment(paymentId: string, organizationId: string, userId: string) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
      with: { invoice: true }
    });
    
    if (!payment || !payment.invoice || payment.invoice.organizationId !== organizationId) {
      throw new Error("Payment not found");
    }

    const [updatedPayment] = await this.repo.updatePayment(paymentId, {
      status: "failed",
      updatedAt: new Date(),
      updatedBy: userId
    });

    return updatedPayment;
  }

  async getFinanceDashboardMetrics(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
      with: { payments: true }
    });

    let revenueThisMonthCents = 0;
    let outstandingRevenueCents = 0;
    let collectionAmountThisMonth = 0;
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

      for (const p of inv.payments) {
        if (p.status === "succeeded" && p.verifiedAt && new Date(p.verifiedAt) >= startOfMonth) {
          collectionAmountThisMonth += p.amount;
        }
        if (p.status === "succeeded") {
          methodMap[p.method || 'unknown'] = (methodMap[p.method || 'unknown'] || 0) + p.amount;
        }
      }
    }

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

  // ------------- RETAINERS ------------- //

  async createRetainer(data: {
    organizationId: string;
    name: string;
    amount: number;
    billingDay: number;
    startDate: Date;
    endDate?: Date;
  }, userId: string) {
    const [retainer] = await database.insert(retainers).values({
      organizationId: data.organizationId,
      name: data.name,
      amount: toPaise(data.amount),
      billingDay: data.billingDay,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active"
    }).returning();
    
    return retainer;
  }

  async updateRetainerStatus(retainerId: string, status: string, userId: string) {
    const [retainer] = await database.update(retainers)
      .set({ status })
      .where(eq(retainers.id, retainerId))
      .returning();
    return retainer;
  }

  async getRetainerDetails(retainerId: string) {
    const retainer = await database.query.retainers.findFirst({
      where: eq(retainers.id, retainerId),
      with: {
        organization: true,
      }
    });

    if (!retainer) return null;

    const periods = await database.query.retainerPeriods.findMany({
      where: eq(retainerPeriods.retainerId, retainerId),
      orderBy: [desc(retainerPeriods.startDate)]
    });

    const periodIds = periods.map(p => p.id);
    const relatedInvoices = periodIds.length > 0 ? await database.query.invoices.findMany({
      where: (i, { inArray }) => inArray(i.retainerPeriodId, periodIds)
    }) : [];

    return { retainer, periods, invoices: relatedInvoices };
  }

  async processRetainerBilling() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Find active retainers where billing day is today or past, and no period created for this month
    const activeRetainers = await database.query.retainers.findMany({
      where: eq(retainers.status, "active")
    });
    
    let generatedCount = 0;

    for (const retainer of activeRetainers) {
      if (retainer.endDate && new Date(retainer.endDate) < today) {
        // Expired, mark as paused/cancelled
        await database.update(retainers).set({ status: 'paused' }).where(eq(retainers.id, retainer.id));
        continue;
      }
      
      // If billing day is in the future for this month, skip
      if (retainer.billingDay > currentDay) continue;

      // Check if period for this month already exists
      const periodName = `${today.toLocaleString('default', { month: 'long' })} ${currentYear}`;
      
      const existingPeriod = await database.query.retainerPeriods.findFirst({
        where: and(
          eq(retainerPeriods.retainerId, retainer.id),
          eq(retainerPeriods.periodName, periodName)
        )
      });

      if (!existingPeriod) {
        // Create period
        const startDate = new Date(currentYear, currentMonth, retainer.billingDay);
        const endDate = new Date(currentYear, currentMonth + 1, retainer.billingDay - 1);
        
        const [period] = await database.insert(retainerPeriods).values({
          retainerId: retainer.id,
          periodName,
          startDate,
          endDate,
          status: 'active'
        }).returning();

        // Create invoice
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + 15); // Net 15
        
        await this.issueInvoice({
          organizationId: retainer.organizationId,
          retainerPeriodId: period.id,
          amount: retainer.amount / 100, // issueInvoice converts to paise
          dueDate
        });
        
        generatedCount++;
      }
    }
    
    return { success: true, generated: generatedCount };
  }
}

export const financeService = new FinanceService();

export async function getInvoiceDetails(invoiceId: string) {
  const data = await database
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      status: invoices.status,
      createdAt: invoices.createdAt,
      dueDate: invoices.dueDate,
      organizationName: organizations.name,
    })
    .from(invoices)
    .leftJoin(organizations, eq(invoices.organizationId, organizations.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (data.length === 0) return null;
  return { ...data[0], lineItems: [] as { title: string; description?: string; amount: number }[] };
}
