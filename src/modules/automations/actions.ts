"use server";

import { internalActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/db";
import { systemAutomations, webhooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createAutomationAction = internalActionClient
  .schema(z.object({
    name: z.string().min(1, "Name is required"),
    triggerEvent: z.string().min(1, "Trigger is required"),
    actionType: z.string().min(1, "Action is required"),
  }))
  .action(async ({ parsedInput }) => {
    await db.insert(systemAutomations).values({
      name: parsedInput.name,
      triggerType: parsedInput.triggerEvent,
      actionType: parsedInput.actionType,
      isActive: true,
    });

    revalidatePath("/settings/automations");
    return { success: true };
  });

export const createWebhookAction = internalActionClient
  .schema(z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Must be a valid URL"),
    events: z.array(z.string()).min(1, "Select at least one event"),
  }))
  .action(async ({ parsedInput }) => {
    await db.insert(webhooks).values({
      description: parsedInput.name,
      url: parsedInput.url,
      events: parsedInput.events,
      isActive: true,
    });

    revalidatePath("/settings/automations");
    return { success: true };
  });

export const deleteAutomationAction = internalActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await db.delete(systemAutomations).where(eq(systemAutomations.id, parsedInput.id));
    revalidatePath("/settings/automations");
    return { success: true };
  });

export const deleteWebhookAction = internalActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await db.delete(webhooks).where(eq(webhooks.id, parsedInput.id));
    revalidatePath("/settings/automations");
    return { success: true };
  });
