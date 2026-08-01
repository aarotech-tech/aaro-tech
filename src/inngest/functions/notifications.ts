import { inngest } from "../client";
import { notificationService } from "@/modules/core/notifications";

const notificationLogic = async ({ event, step }: any) => {
  await step.run("dispatch-notification", async () => {
    let message = `New activity: ${event.name}`;
    let recipient = "admin"; 

    switch (event.name) {
      case "Domain/InvoiceCreated":
        message = `New invoice created for amount ${event.data.amount}`;
        recipient = "client";
        break;
      case "Domain/InvoicePaid":
        message = `Invoice ${event.data.invoiceId} was paid!`;
        recipient = "finance_team";
        break;
      case "Domain/DeliverableApproved":
        message = `Deliverable approved!`;
        recipient = "delivery_team";
        break;
      case "Domain/PaymentVerified":
        message = `Payment ${event.data.paymentId} was successfully verified!`;
        recipient = "client";
        break;
      case "Domain/WebsiteLeadCreated":
        message = `New website lead: ${event.data.name} (${event.data.email})`;
        recipient = "sales_team";

        try {
          const { sendEmail } = await import("@/lib/email");
          await sendEmail({
            to: process.env.CONTACT_EMAIL || "info@aarotech.in",
            subject: `New Website Lead: ${event.data.name}`,
            html: `
              <h2>New Website Lead</h2>
              <p><strong>Name:</strong> ${event.data.name}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Phone:</strong> ${event.data.phone || 'N/A'}</p>
              <p><strong>Business Name:</strong> ${event.data.businessName || 'N/A'}</p>
              <p><strong>Website URL:</strong> ${event.data.websiteUrl || 'N/A'}</p>
              <p><strong>Challenge:</strong> ${event.data.challenge}</p>
              <p>Please log in to the CRM to review and qualify this lead.</p>
            `
          });
        } catch (e) {
          console.error("Failed to send lead email", e);
        }
        
        // Pass null for organizationId since a raw lead is not an organization yet
        event.data.organizationId = null;
        break;
      case "Domain/LeadQualified":
        message = `Lead qualified and converted to deal!`;
        recipient = "sales_team";
        break;
      case "Domain/ProjectCreated":
        message = `New project ${event.data.projectName} created!`;
        recipient = "delivery_team";
        break;
      case "Domain/ProjectCompleted":
        message = `Project completed!`;
        recipient = "delivery_team";
        break;
      case "Domain/DeliverableSubmitted":
        message = `New deliverable submitted for your review.`;
        recipient = "client";
        break;
      case "Domain/DeliverableRejected":
        message = `Deliverable was rejected by the client and requires revision.`;
        recipient = "delivery_team";
        break;
      case "Domain/ClientJoinedPortal":
        message = `Client successfully joined the portal!`;
        recipient = "internal";
        break;
      case "Domain/DealStageChanged":
        message = `Deal stage updated to: ${event.data.stage}`;
        recipient = "sales_team";
        break;
      case "Domain/ProposalCreated":
        message = `New proposal drafted for deal ${event.data.dealId}.`;
        recipient = "sales_team";
        break;
      case "Domain/ProposalSent":
        message = `Proposal sent to client ${event.data.clientEmail}.`;
        recipient = "sales_team";
        break;
      case "Domain/ProposalAccepted":
        message = `Proposal accepted! Moving to implementation.`;
        recipient = "sales_team";
        break;
      case "Domain/InvoiceSent":
        message = `You have a new invoice waiting for payment.`;
        recipient = "client";
        break;
      case "Domain/InvoiceViewed":
        message = `Invoice ${event.data.invoiceId} was viewed by the client.`;
        recipient = "finance_team";
        break;
      case "Domain/TaskAssigned":
        message = `You have been assigned a new task on project ${event.data.projectId}.`;
        recipient = event.data.assigneeId || "delivery_team";
        break;
    }

    await notificationService.sendInAppNotification({
      recipient,
      organizationId: event.data.organizationId,
      message,
    });
  });
};

export const handleStandardNotifications = inngest.createFunction(
  {
    id: "handle-standard-notifications",
    triggers: [
      { event: "Domain/InvoiceCreated" },
      { event: "Domain/InvoicePaid" },
      { event: "Domain/DeliverableApproved" },
      { event: "Domain/DealCreated" },
      { event: "Domain/PaymentVerified" },
      { event: "Domain/WebsiteLeadCreated" },
      { event: "Domain/LeadQualified" },
      { event: "Domain/ProjectCreated" },
      { event: "Domain/ProjectCompleted" },
      { event: "Domain/DeliverableSubmitted" }
    ]
  },
  notificationLogic
);

export const handleSecondaryNotifications = inngest.createFunction(
  {
    id: "handle-secondary-notifications",
    triggers: [
      { event: "Domain/DeliverableRejected" },
      { event: "Domain/ClientJoinedPortal" },
      { event: "Domain/DealStageChanged" },
      { event: "Domain/ProposalCreated" },
      { event: "Domain/ProposalSent" },
      { event: "Domain/ProposalAccepted" },
      { event: "Domain/InvoiceSent" },
      { event: "Domain/InvoiceViewed" },
      { event: "Domain/TaskAssigned" }
    ]
  },
  notificationLogic
);
