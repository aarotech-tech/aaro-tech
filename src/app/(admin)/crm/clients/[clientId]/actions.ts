"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';

import { db } from "@/db";
import { onboardingSteps, clientOnboardings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth";

export async function toggleOnboardingStep(clientId: string, stepId: string, newStatus: "pending" | "completed") {
  return withActionErrorHandling('toggleOnboardingStep', async () => {
    await requireInternalUser();
    await db.transaction(async (tx) => {
      // 1. Update the specific step
      await tx.update(onboardingSteps)
        .set({ status: newStatus })
        .where(eq(onboardingSteps.id, stepId));

      // 2. Check if all steps are completed to update the overall onboarding status
      const step = await tx.query.onboardingSteps.findFirst({
        where: eq(onboardingSteps.id, stepId)
      });

      if (step) {
        const allSteps = await tx.query.onboardingSteps.findMany({
          where: eq(onboardingSteps.onboardingId, step.onboardingId)
        });

        const allCompleted = allSteps.every(s => s.status === "completed");
        
        await tx.update(clientOnboardings)
          .set({ status: allCompleted ? "completed" : "pending" })
          .where(eq(clientOnboardings.id, step.onboardingId));
      }
    });
    
    revalidatePath(`/crm/clients/${clientId}`);
    revalidatePath(`/crm/clients`);
    return true;
  });
}
