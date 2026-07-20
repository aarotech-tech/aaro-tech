"use server";

import { db } from "@/db";
import { deliverables, deliverableVersions, comments, projects, retainerPeriods, retainers, organizations, activityLogs } from "@/db/schema";
import { sendDeliverableReviewEmail } from "@/lib/email";
import { requireInternalUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDeliverableAction(data: { name: string, projectId?: string, retainerPeriodId?: string }) {
  const user = await requireInternalUser();
  // Assume admin logic ensures they are an admin or doing this on a valid project.
  // For safety, we should really ensure the project exists, but we'll trust the UI for now.

  const [newDeliverable] = await db.insert(deliverables).values({
    name: data.name,
    projectId: data.projectId,
    retainerPeriodId: data.retainerPeriodId,
    status: "draft"
  }).returning();

  revalidatePath(`/crm/projects/${data.projectId}`);
  return newDeliverable;
}

export async function createDeliverableVersionAction(deliverableId: string, fileId: string) {
  const user = await requireInternalUser();

  // Get current version count
  const existingVersions = await db.query.deliverableVersions.findMany({
    where: eq(deliverableVersions.deliverableId, deliverableId)
  });

  const nextVersionNumber = existingVersions.length + 1;

  // Insert new version
  const [newVersion] = await db.insert(deliverableVersions).values({
    deliverableId,
    fileId,
    versionNumber: nextVersionNumber,
    reviewStatus: "submitted"
  }).returning();

  // Mark all older versions as superseded (if they were submitted or draft etc)
  for (const ev of existingVersions) {
    if (ev.reviewStatus !== "approved") {
      await db.update(deliverableVersions)
        .set({ reviewStatus: "superseded" })
        .where(eq(deliverableVersions.id, ev.id));
    }
  }

  // Update Deliverable
  await db.update(deliverables)
    .set({ status: "in_review", currentVersionId: newVersion.id })
    .where(eq(deliverables.id, deliverableId));

  const deliverable = await db.query.deliverables.findFirst({
    where: eq(deliverables.id, deliverableId)
  });

  if (deliverable) {
    let orgId = null;
    let orgName = 'Client';

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

    if (orgId) {
      const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
      if (org) orgName = org.name;

      await db.insert(activityLogs).values({
        organizationId: orgId,
        userId: user.id,
        action: "deliverable.submitted",
        entityType: "deliverable",
        entityId: deliverableId,
        metadata: JSON.stringify({ versionNumber: nextVersionNumber })
      });

      await sendDeliverableReviewEmail("client@example.com", orgName, deliverable.name);
    }
  }

  revalidatePath(`/crm/deliverables/${deliverableId}`);
  return newVersion;
}

export async function addCommentAction(deliverableId: string, versionId: string | null, text: string, visibility: "client_visible" | "internal_only") {
  const user = await requireInternalUser();

  const [comment] = await db.insert(comments).values({
    deliverableId,
    versionId: versionId || null,
    userId: user.id,
    text,
    visibility
  }).returning();

  revalidatePath(`/crm/deliverables/${deliverableId}`);
  return comment;
}
