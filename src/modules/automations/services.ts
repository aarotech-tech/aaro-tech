import { db } from "@/db";
import { systemAutomations, webhooks } from "@/db/schema";
import { desc } from "drizzle-orm";

export const AutomationService = {
  getSystemAutomations: async () => {
    return await db.query.systemAutomations.findMany({
      orderBy: [desc(systemAutomations.createdAt)],
    });
  },

  getWebhooks: async () => {
    return await db.query.webhooks.findMany({
      orderBy: [desc(webhooks.createdAt)],
    });
  },
};
