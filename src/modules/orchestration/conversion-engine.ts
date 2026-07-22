import { db } from "@/db";
import * as salesService from "@/modules/sales/services";
import { createProjectFromDeal, activateProject } from "@/modules/delivery/services";
import { financeService } from "@/modules/finance/services";

export class ConversionEngine {
  /**
   * Orchestrates the handoff from Sales to Delivery and Finance when a proposal is accepted.
   * Wraps the entire flow in a single Drizzle database transaction.
   */
  async handleProposalAccepted(dealId: string, organizationId: string) {
    // We execute the conversion process inside a single transaction to ensure Atomicity.
    return db.transaction(async (tx) => {
      // 1. Sales: Mark the deal as won
      const deal = await salesService.markDealWon(dealId, organizationId, tx);

      // 2. Delivery: Scaffold the project for the delivery team
      const project = await createProjectFromDeal(deal.id, deal.name, tx);

      // 3. Finance: Create a deposit invoice with a specific deposit configuration
      // Assuming a 50% deposit policy for this conversion type
      const depositConfig = { type: 'percentage', value: 50 };
      const totalValueCents = (deal.value || 0) * 100;
      const depositAmountCents = depositConfig.type === 'percentage' 
        ? Math.round(totalValueCents * (depositConfig.value / 100))
        : depositConfig.value * 100;

      const invoice = await financeService.createDepositInvoice(
        organizationId, 
        project.id, 
        depositAmountCents, 
        tx
      );

      return { deal, project, invoice };
    });
  }

  /**
   * Orchestrates the activation of a project once the deposit is paid.
   */
  async handleInvoicePaid(invoiceId: string, organizationId: string) {
    const invoice = await financeService.getInvoiceById(invoiceId);
    if (!invoice || !invoice.projectId) return;

    // We can activate the project directly since activation is an atomic operation on the project table.
    const project = await activateProject(invoice.projectId, organizationId);
    return project;
  }
}

export const conversionEngine = new ConversionEngine();
