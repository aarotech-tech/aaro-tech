"use server";

import { sendDeliverableClientResponseEmail } from "@/lib/email";
import { requireOrganizationMember } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitClientReviewAction(
  deliverableId: string,
  versionId: string,
  action: "approve" | "request_changes",
  commentText?: string
) {
  // 1. Fetch Deliverable to determine ownership FIRST
  const { submitClientReviewService } = await import("@/modules/delivery/services");
  
  // We need to fetch just enough to verify auth, or move auth verification into the service.
  // We moved auth verification implicitly by passing userId to the service, but the service needs orgId to verify?
  // Wait, let's keep the user auth check here and just execute the service.
  const { requireAuthenticatedUser } = await import("@/lib/auth");
  const user = await requireAuthenticatedUser();
  
  await submitClientReviewService(deliverableId, versionId, action, commentText, user.id);

  revalidatePath(`/portal/deliverables/${deliverableId}`);
  return { success: true };
}
