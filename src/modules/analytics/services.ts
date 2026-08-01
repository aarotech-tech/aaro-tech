import { db } from "@/db";
import { invoices, organizations, deals, projects } from "@/db/schema";
import { sql, eq, and, desc, gte } from "drizzle-orm";

export class AnalyticsService {
  async getRevenueStats() {
    const allInvoices = await db.select({
      amount: invoices.amount,
      status: invoices.status,
    }).from(invoices);

    const totalBilled = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = allInvoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
    const totalOutstanding = allInvoices.filter(i => ["open", "partially_paid", "overdue"].includes(i.status as string)).reduce((sum, inv) => sum + inv.amount, 0);

    return { totalBilled, totalCollected, totalOutstanding };
  }

  async getSalesFunnel() {
    const allDeals = await db.select({ stage: deals.stage }).from(deals);
    
    // We treat 'organizations' with type 'lead' as the top of funnel
    const allOrgs = await db.select({ type: organizations.type }).from(organizations);
    
    const leads = allOrgs.filter(o => o.type === "lead").length;
    const activeDeals = allDeals.filter(d => !["won", "lost"].includes(d.stage as string)).length;
    const wonDeals = allDeals.filter(d => d.stage === "won").length;

    return { leads, activeDeals, wonDeals };
  }

  async getPipelineForecast() {
    const activeDeals = await db.select({
      value: deals.value,
      probability: deals.probability,
    })
    .from(deals)
    .where(and(eq(deals.stage, "open"))); // Simplified, assuming 'open' or similar

    // Calculate expected value (value * probability / 100)
    let forecast = 0;
    activeDeals.forEach(deal => {
      forecast += (deal.value || 0) * ((deal.probability ?? 50) / 100);
    });

    return { forecast };
  }
}

export const analyticsService = new AnalyticsService();
