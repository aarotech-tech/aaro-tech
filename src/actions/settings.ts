"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CoreService } from "@/modules/core/services";
import { internalActionClient } from "@/lib/safe-action";
import { z } from "zod";
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

    revalidatePath("/settings");
    
    return { success: true };
  });
