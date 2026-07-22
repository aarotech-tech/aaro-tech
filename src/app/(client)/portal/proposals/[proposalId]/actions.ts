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

      const { approveProposalClient } = await import("@/modules/sales/services");
      await approveProposalClient(proposalId, signature, ip);

      revalidatePath(`/portal/proposals/${proposalId}`);
      revalidatePath(`/sales/proposals/${proposalId}`);
      revalidatePath("/sales");
      
      return { success: true };
    });
});
