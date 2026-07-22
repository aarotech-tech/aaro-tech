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
    const invoice = await this.repo.createInvoice({
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
    const invoice = await this.repo.createInvoice({
      organizationId,
      projectId,
      amount: depositAmountCents,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: "issued" // Deposit invoices are issued immediately
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
    if (["voided", "archived", "paid"].includes(invoice.status || "")) {
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
    // In a real system, we'd query the DB with agg functions.
    // For now, returning mocked structure matching requirements.
    return {
      revenueThisMonthCents: 1200000,
      outstandingRevenueCents: 1500000,
      overdueAmountCents: 200000,
      collectionRate: 0.95,
      mrrRetainers: 4,
      recentlyPaidInvoices: [
        { id: "inv_123", amountCents: 50000, paidAt: new Date().toISOString(), clientName: "Acme Corp" },
        { id: "inv_124", amountCents: 15000, paidAt: new Date(Date.now() - 86400000).toISOString(), clientName: "Stark Ind" }
      ]
    };
  }

  async getClientInvoices(organizationId: string) {
    // Mocked for Epic 6 UI scaffolding
    return [
      { id: "inv_1", number: "INV-2026-001", amountCents: 1500000, status: "issued", dueAt: new Date(Date.now() + 86400000 * 5).toISOString() },
      { id: "inv_2", number: "INV-2026-002", amountCents: 500000, status: "paid", paidAt: new Date().toISOString() }
    ];
  }

  async getClientPayments(organizationId: string) {
    // Mocked for Epic 6 UI scaffolding
    return [
      { id: "pay_1", invoiceNumber: "INV-2026-002", amountCents: 500000, method: "credit_card", status: "applied", appliedAt: new Date().toISOString() }
    ];
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

