import { db } from "@/db";
import { organizations, users, deals, proposals, projects, invoices, payments, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { actionClient, internalActionClient, tenantActionClient } from "@/lib/safe-action";
import { createDealAction, addDealLineItemAction } from "@/modules/sales/actions";
import { createInvoiceAction, recordManualPaymentAction } from "@/actions/finance";
import { createProjectAction, createTaskAction } from "@/modules/delivery/actions";
import { financeService } from "@/modules/finance/services";

async function run() {
  console.log("Starting E2E Validation...");

  // Get first user and org
  let org = await db.query.organizations.findFirst({ where: eq(organizations.type, "client") });
  let internalUser = await db.query.users.findFirst({ where: eq(users.userType, "internal") });
  let clientUser = await db.query.users.findFirst({ where: eq(users.userType, "client") });

  if (!org || !internalUser || !clientUser) {
    console.log("Creating initial seed data...");
    const [insertedOrg] = await db.insert(organizations).values({
      clerkOrgId: "org_" + Date.now(),
      name: "E2E Test Corp",
      slug: "e2e-test-corp-" + Date.now(),
      type: "client"
    }).returning();
    org = insertedOrg;

    const [insertedInternalUser] = await db.insert(users).values({
      clerkId: "user_" + Date.now(),
      email: "internal" + Date.now() + "@aarotech.com",
      userType: "internal",
      role: "superadmin"
    }).returning();
    internalUser = insertedInternalUser;

    const [insertedClientUser] = await db.insert(users).values({
      clerkId: "client_" + Date.now(),
      email: "client" + Date.now() + "@e2etest.com",
      userType: "client",
      role: "client"
    }).returning();
    clientUser = insertedClientUser;
  }

  try {
    // 1. Create Deal
    console.log("1. Creating Deal...");
    const SalesService = require("@/modules/sales/services");
    const deal = await SalesService.createDealService({
      organizationId: org.id, 
      name: "E2E Test Deal", 
      ownerId: internalUser.id,
      value: 0
    });
    console.log("Deal created:", deal.id);

    // 2. Add Line item
    console.log("2. Adding line item...");
    await SalesService.addDealLineItemService({
      dealId: deal.id,
      title: "Web Dev", 
      quantity: 1, 
      unitPrice: 500000,
      isRecurring: false
    });
    
    // 3. Create Draft Proposal
    console.log("3. Creating Draft Proposal...");
    const proposal = await SalesService.createDraftProposalService(deal.id);
    console.log("Proposal created:", proposal.id);

    // Mock writing the proposal
    await db.update(proposals).set({ documentData: "{\"blocks\":[]}" }).where(eq(proposals.id, proposal.id));

    console.log("3.5. Sending Proposal...");
    await SalesService.sendProposalToClientService(proposal.id);

    // 4. Approve Proposal (Client)
    console.log("4. Client Approving Proposal...");
    await SalesService.approveProposalClient(proposal.id, "John Doe E2E", "127.0.0.1");

    // The event bus should have created a project. Let's wait a moment for async events.
    await new Promise(r => setTimeout(r, 2000));

    // 5. Verify Project Creation
    console.log("5. Verifying Project...");
    const project = await db.query.projects.findFirst({ where: eq(projects.dealId, deal.id) });
    if (!project) throw new Error("Project not automatically created via Event Bus!");
    console.log("Project automatically created:", project.id);

    // 6. Create Task
    console.log("6. Creating Task...");
    const DeliveryService = require("@/modules/delivery/services");
    const task = await DeliveryService.createTaskService({
      projectId: project.id,
      title: "Design Mockups",
      assigneeId: internalUser.id,
      createdBy: internalUser.id,
      organizationId: org.id
    });
    console.log("Task created:", task.id);

    // 7. Create Invoice
    console.log("7. Creating Invoice...");
    const invoice = await financeService.issueInvoice({
      organizationId: org.id,
      projectId: project.id,
      amount: 5000, // $5000 -> 500000 cents
      dueDate: new Date()
    });
    console.log("Invoice created:", invoice.id);

    // 8. Record Payment
    console.log("8. Recording Payment...");
    const { recordManualPaymentService } = require("@/modules/finance/services");
    const payment = await recordManualPaymentService({
      invoiceId: invoice.id,
      amount: invoice.amount,
      method: "bank_transfer",
      paidAt: new Date().toISOString(),
      userId: internalUser.id,
      organizationId: org.id
    });
    console.log("Payment recorded:", payment.id);

    // Verify Invoice Status updated
    const updatedInvoice = await db.query.invoices.findFirst({ where: eq(invoices.id, invoice.id) });
    if (updatedInvoice?.status !== "paid") {
      throw new Error("Invoice status did not transition to paid!");
    }
    console.log("Invoice status successfully updated to:", updatedInvoice.status);

    console.log("E2E Validation Successful!");
  } catch (e) {
    console.error("E2E Validation Failed:", e);
  }
}

run();
