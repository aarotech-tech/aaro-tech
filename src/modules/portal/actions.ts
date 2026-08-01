"use server";

import { tenantActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/db";
import { clientOnboardings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const completeOnboardingAction = tenantActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    // Check if onboarding record exists
    const existing = await db.query.clientOnboardings.findFirst({
      where: eq(clientOnboardings.organizationId, ctx.orgId)
    });

    if (existing) {
      await db.update(clientOnboardings)
        .set({ status: "completed" })
        .where(eq(clientOnboardings.id, existing.id));
    } else {
      await db.insert(clientOnboardings).values({
        organizationId: ctx.orgId,
        status: "completed"
      });
    }

    // Emit event for Welcome Email
    const { emitDomainEvent } = await import("@/modules/core/events");
    await emitDomainEvent({
      type: "ClientJoinedPortal",
      payload: {
        organizationId: ctx.orgId,
        userId: ctx.userId
      }
    });

    revalidatePath("/onboarding");
    return { success: true };
  });
