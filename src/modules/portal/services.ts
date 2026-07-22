import { db } from "@/db";
import { projects, invoices, clientOnboardings, onboardingSteps } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class PortalService {
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
}

export const portalService = new PortalService();
