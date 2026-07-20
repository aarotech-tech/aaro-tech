"use server";

import { db } from "@/db";
import { deliverables, deliverableVersions, comments, projects, retainerPeriods, retainers, activityLogs } from "@/db/schema";
import { sendDeliverableClientResponseEmail } from "@/lib/email";
import { requireOrganizationMember } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitClientReviewAction(
  deliverableId: string,
  versionId: string,
  action: "approve" | "request_changes",
  commentText?: string
) {
  // 1. Fetch Deliverable to determine ownership FIRST
  const deliverable = await db.query.deliverables.findFirst({
    where: eq(deliverables.id, deliverableId)
  });

  if (!deliverable) throw new Error("Deliverable not found");

  let orgId = null;

  if (deliverable.projectId) {
    const p = await db.query.projects.findFirst({ where: eq(projects.id, deliverable.projectId) });
    orgId = p?.organizationId;
  } else if (deliverable.retainerPeriodId) {
    const rp = await db.query.retainerPeriods.findFirst({ where: eq(retainerPeriods.id, deliverable.retainerPeriodId) });
    if (rp) {
      const r = await db.query.retainers.findFirst({ where: eq(retainers.id, rp.retainerId) });
      orgId = r?.organizationId;
    }
  }

  if (!orgId) throw new Error("Deliverable ownership could not be verified");

  // 2. Verify that the authenticated user belongs to this org
  const { user } = await requireOrganizationMember(orgId);

  // 3. Mutate safely (sequential without transaction for neon-http compatibility)
  // If they left a comment, add it
  if (commentText && commentText.trim() !== "") {
    await db.insert(comments).values({
      deliverableId,
      versionId,
      userId: user.id,
      text: commentText,
      visibility: "client_visible"
    });
  }

  // Update Version Status
  const newReviewStatus = action === "approve" ? "approved" : "changes_requested";
  await db.update(deliverableVersions)
    .set({ reviewStatus: newReviewStatus })
    .where(eq(deliverableVersions.id, versionId));

  // Update Deliverable Status
  const newDeliverableStatus = action === "approve" ? "approved" : "changes_requested";
  await db.update(deliverables)
    .set({ status: newDeliverableStatus })
    .where(eq(deliverables.id, deliverableId));

  // Activity Log
  await db.insert(activityLogs).values({
    organizationId: orgId,
    userId: user.id,
    action: `deliverable.${newDeliverableStatus}`,
    entityType: "deliverable",
    entityId: deliverableId,
    metadata: JSON.stringify({ versionId })
  });

  // Send Email Notification outside transaction
  await sendDeliverableClientResponseEmail("info@aarotech.in", deliverable.name, newDeliverableStatus);

  revalidatePath(`/portal/deliverables/${deliverableId}`);
  return { success: true };
}
