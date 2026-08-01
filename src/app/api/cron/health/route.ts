import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, invoices, projects, notifications, deals } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // 1. Client Health Scoring
    const allClients = await db.select().from(organizations).where(eq(organizations.type, "client"));
    
    // For each client, calculate a health score (mocked algorithm for now based on available fields)
    for (const client of allClients) {
      // Find invoices for client
      const clientInvoices = await db.select().from(invoices).where(eq(invoices.organizationId, client.id));
      
      let healthScore = 100;
      
      const overdue = clientInvoices.filter(i => i.status === "overdue").length;
      if (overdue > 0) {
        healthScore -= (overdue * 10); // Minus 10 per overdue invoice
      }
      
      // Minimum score is 0
      healthScore = Math.max(0, healthScore);
      
      // Update health score
      await db.update(organizations).set({ healthScore }).where(eq(organizations.id, client.id));
      
      // 2. Predictive Alerts
      // If health drops below 50, trigger notification
      if (healthScore < 50) {
        // Find an admin user to notify
        const adminUser = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.userType, "internal") });
        if (adminUser) {
          await db.insert(notifications).values({
            userId: adminUser.id,
            organizationId: client.id,
            type: "system",
            message: `[At-Risk Client] ${client.name} has a health score of ${healthScore}. Immediate attention required.`,
            entityType: "organization",
            entityId: client.id,
          });
        }
      }
    }
    
    // Check for Stalled Deals
    const openDeals = await db.select().from(deals).where(inArray(deals.stage, ["open", "negotiation", "proposal"]));
    const now = new Date();
    
    for (const deal of openDeals) {
      const updatedAt = new Date(deal.updatedAt || deal.createdAt!);
      const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24));
      
      if (daysSinceUpdate > 14) {
        // notify the deal owner or an admin
        const notifyUserId = deal.ownerId || (await db.query.users.findFirst({ where: (users, { eq }) => eq(users.userType, "internal") }))?.id;
        
        if (notifyUserId) {
          await db.insert(notifications).values({
            userId: notifyUserId,
            organizationId: deal.organizationId,
            type: "system",
            message: `[Stalled Deal] Deal "${deal.name}" has been stalled for ${daysSinceUpdate} days.`,
            entityType: "deal",
            entityId: deal.id,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Health & Alerts processed" });
  } catch (error: any) {
    console.error("Health Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
