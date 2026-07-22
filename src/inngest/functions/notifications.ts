import { inngest } from "../client";
import { notificationService } from "@/modules/core/notifications";

// A generic notification handler that listens to multiple events
export const handleStandardNotifications = inngest.createFunction(
  {
    id: "handle-standard-notifications",
    triggers: [
      { event: "Domain/InvoiceCreated" },
      { event: "Domain/InvoicePaid" },
      { event: "Domain/DeliverableApproved" },
      { event: "Domain/DealCreated" },
    ]
  },
  async ({ event, step }) => {
    await step.run("dispatch-notification", async () => {
      // In a real app we'd map event.name to specific messages or use a template registry
      let message = `New activity: ${event.name}`;
      let recipient = "admin"; // Fallback recipient
      
      switch (event.name) {
        case "Domain/InvoiceCreated":
          message = `New invoice created for amount ${event.data.amount}`;
          recipient = "client"; // Notification Resolver should target client admins
          break;
        case "Domain/InvoicePaid":
          message = `Invoice ${event.data.invoiceId} was paid!`;
          recipient = "finance_team";
          break;
        case "Domain/DeliverableApproved":
          message = `Deliverable approved!`;
          recipient = "delivery_team";
          break;
      }

      await notificationService.sendInAppNotification({
        recipient,
        organizationId: event.data.organizationId,
        message,
      });
    });
  }
);
