"use server";

import { z } from "zod";

import { db } from "@/db";
import { organizations, contacts, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CoreService } from "@/modules/core/services";
import { internalActionClient } from "@/lib/safe-action";
import { updateOrganizationSettingsSchema } from "@/lib/validations/settings";

export const updateOrganizationSettings = internalActionClient
  .schema(updateOrganizationSettingsSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Wait, the context gives us `user`. We can just find the internal org.
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.type, "internal"),
    });

    if (!org) {
      throw new Error("Internal organization not found");
    }

    const { name, taxId, address, city, country } = parsedInput;

    await CoreService.updateOrgSettings(org.id, {
      name,
      taxId: taxId || null,
      address: address || null,
      city: city || null,
      country: country || null,
      updatedAt: new Date(),
    });

    revalidatePath("/(admin)/settings", "page");
    
    return { success: true };
  });
const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  globalRole: z.string().min(1),
});

export const updateUserRoleAction = internalActionClient
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput }) => {
    const user = await CoreService.updateUserRole(parsedInput.userId, parsedInput.globalRole);
    revalidatePath("/(admin)/settings/team", "page");
    return user;
  });

const toggleUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
});

export const toggleUserStatusAction = internalActionClient
  .schema(toggleUserStatusSchema)
  .action(async ({ parsedInput }) => {
    let user;
    if (parsedInput.status === "suspended") {
      user = await CoreService.suspendUser(parsedInput.userId);
    } else {
      user = await CoreService.activateUser(parsedInput.userId);
    }
    revalidatePath("/(admin)/settings/team", "page");
    return user;
  });
const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  isActive: z.boolean().default(true),
});

export const upsertServiceAction = internalActionClient
  .schema(serviceSchema)
  .action(async ({ parsedInput }) => {
    if (parsedInput.id) {
      await db.update(services).set({
        name: parsedInput.name,
        description: parsedInput.description,
        basePrice: parsedInput.basePrice,
        isActive: parsedInput.isActive,
      }).where(eq(services.id, parsedInput.id));
    } else {
      await db.insert(services).values({
        name: parsedInput.name,
        description: parsedInput.description,
        basePrice: parsedInput.basePrice,
        isActive: parsedInput.isActive,
      });
    }
    revalidatePath("/(admin)/settings/services", "page");
    return { success: true };
  });
