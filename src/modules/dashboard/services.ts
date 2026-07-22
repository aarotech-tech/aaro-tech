import { db } from "@/db";
import { deals, projects, invoices, auditLogs, organizations, users } from "@/db/schema";
import { eq, desc, sum, count, sql } from "drizzle-orm";

import { unstable_cache } from "next/cache";

export class DashboardService {
  async getKPIs() {
    const fetchKPIs = unstable_cache(
      async () => {
        // Pipeline Value
        const activeDeals = await db.query.deals.findMany({
          where: eq(deals.stage, "discovery")
        });
        const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const activeDealsCount = activeDeals.length;

        // Active Projects Count
        const activeProjects = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.status, "active"));

        // Pending Invoices Amount
        const pendingInvoices = await db.query.invoices.findMany({
          where: eq(invoices.status, "open")
        });
        const pendingInvoicesAmount = pendingInvoices.reduce((s, inv) => s + (inv.amount || 0), 0) / 100;

        return {
          pipelineValue,
          activeDealsCount,
          activeProjectsCount: activeProjects[0].count,
          pendingInvoicesAmount
        };
      },
      ['dashboard-kpis'],
      { tags: ['dashboard'], revalidate: 300 } // Cache for 5 mins, can be manually invalidated using revalidateTag
    );
    
    return fetchKPIs();
  }

  async getRecentActivity() {
    return db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        createdAt: auditLogs.createdAt,
        organizationName: organizations.name,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(auditLogs)
      .leftJoin(organizations, eq(auditLogs.organizationId, organizations.id))
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);
  }
}

export const dashboardService = new DashboardService();
