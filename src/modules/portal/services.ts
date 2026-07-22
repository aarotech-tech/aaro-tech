import { db } from "@/db";
import { projects, invoices, clientOnboardings, onboardingSteps, organizationMembers, organizations, clientAssets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notificationService } from "@/modules/core/notifications";

export class PortalService {
  async getClientMembership(userId: string) {
    const membership = await db.query.organizationMembers.findFirst({
      where: eq(organizationMembers.userId, userId)
    });
    if (!membership) return null;

    const myOrg = await db.query.organizations.findFirst({
      where: eq(organizations.id, membership.organizationId)
    });
    return { membership, myOrg };
  }

  async getDashboardData(organizationId: string, userId: string) {
    const [activeProjects, recentAssets, onboardingStatus, clientInvoices, inboxFeed] = await Promise.all([
      db.query.projects.findMany({
        where: eq(projects.organizationId, organizationId),
        orderBy: [desc(projects.createdAt)]
      }),
      db.query.clientAssets.findMany({
        where: eq(clientAssets.organizationId, organizationId),
        orderBy: [desc(clientAssets.createdAt)],
        limit: 5
      }),
      this.getOnboardingStatus(organizationId),
      db.query.invoices.findMany({
        where: eq(invoices.organizationId, organizationId),
        orderBy: [desc(invoices.dueDate)],
      }),
      notificationService.getDashboardFeed(userId)
    ]);

    return { activeProjects, recentAssets, onboardingStatus, clientInvoices, inboxFeed };
  }

  async getOnboardingStatus(organizationId: string) {
    // 1. Check if they have an active project
    const activeProject = await db.query.projects.findFirst({
      where: and(
        eq(projects.organizationId, organizationId),
        eq(projects.status, "active")
      )
    });

    // 2. Check if deposit is paid
    const paidInvoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.status, "paid")
      )
    });

    // 3. Has portal access configured (assumed true if they are logged in)
    
    return [
      {
        id: "project_setup",
        title: "Project Setup",
        completed: !!activeProject,
        description: activeProject ? "Your project has been set up." : "We are setting up your project."
      },
      {
        id: "deposit_paid",
        title: "Deposit Paid",
        completed: !!paidInvoice,
        description: paidInvoice ? "Your deposit has been verified." : "Please pay your deposit invoice."
      },
      {
        id: "portal_access",
        title: "Portal Access",
        completed: true,
        description: "You have successfully accessed the client portal."
      }
    ];
  }
  async getClientAssets(organizationId: string) {
    return await db.query.clientAssets.findMany({
      where: eq(clientAssets.organizationId, organizationId),
      orderBy: [desc(clientAssets.createdAt)]
    });
  }

  async uploadMockAsset(organizationId: string, name: string) {
    await db.insert(clientAssets).values({
      organizationId,
      name,
      fileType: "pdf",
      fileUrl: "#",
    });
  }
}

export const portalService = new PortalService();

