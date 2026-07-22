import { inngest } from "../client";
import { createProjectFromDeal } from "@/modules/delivery/services";
import { notificationService } from "@/modules/core/notifications";

// Mocking orchestration flow for Epic 7 validation.
export const handleDealWon = inngest.createFunction(
  { id: "handle-deal-won", triggers: [{ event: "Domain/DealWon" }] },
  async ({ event, step }) => {
    // This is the core orchestration logic
    const { organizationId, dealId, dealName } = event.data;
    
    // 1. Create a Project via orchestration
    const project = await step.run("create-project-from-deal", async () => {
      return await createProjectFromDeal(dealId, `Project: ${dealName || "New Implementation"}`);
    });

    // 2. Schedule notifications
    await step.run("notify-delivery-team", async () => {
      await notificationService.sendInAppNotification({
        recipient: "delivery_team",
        organizationId,
        message: `A new project "${project.name}" has been created from a Won Deal.`,
        entityType: "project",
        entityId: project.id
      });
    });

    return { project };
  }
);

// We'll add more workflows here later as required by Epic 7 catalog
