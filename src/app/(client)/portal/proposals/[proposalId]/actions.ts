"use server";

import { db } from "@/db";
import { proposals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveProposalAction(proposalId: string, formData: FormData) {
  const signature = formData.get("signature") as string;
  
  if (!signature) return;

  // In production, you would extract the IP from headers():
  // import { headers } from "next/headers";
  // const ip = headers().get("x-forwarded-for") || "unknown";
  
  await db.update(proposals)
    .set({ 
      status: "accepted",
      approvedAt: new Date(),
      signatureText: signature,
      approvedByIp: "127.0.0.1", // Mocked IP for local dev
    })
    .where(eq(proposals.id, proposalId));
    
  revalidatePath(`/portal/proposals/${proposalId}`);
  revalidatePath(`/crm/proposals/${proposalId}`);
}
