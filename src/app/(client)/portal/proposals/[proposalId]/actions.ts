"use server";
import { withActionErrorHandling, AppError } from '@/lib/errors';
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { rateLimit } from '@/lib/rate-limit';

const approveProposalSchema = z.object({
  proposalId: z.string().uuid(),
  signature: z.string().min(1, "Signature is required"),
});

export const approveProposalAction = actionClient
  .schema(approveProposalSchema)
  .action(async ({ parsedInput: { proposalId, signature } }) => {
    return withActionErrorHandling('approveProposalAction', async () => {
      const forwardedFor = (await headers()).get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(',')[0] : "unknown";

      await rateLimit.check(`proposal_approval_${ip}`, { points: 5, durationInSeconds: 3600 });

      const { approveProposalByToken } = await import("@/modules/sales/services");
      await approveProposalByToken(proposalId, signature, ip);

      revalidatePath(`/(client)/portal/proposals/${proposalId}`, "page");
      revalidatePath(`/(admin)/sales/proposals/${proposalId}`, "page");
      revalidatePath("/(admin)/sales", "layout");
      
      return { success: true };
    });
});
