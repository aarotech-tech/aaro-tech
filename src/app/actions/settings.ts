"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireInternalUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrganizationSettings(formData: FormData) {
  await requireInternalUser();
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.type, "internal"),
  });

  if (!org) {
    throw new Error("Internal organization not found");
  }

  const organizationId = org.id;

  const name = formData.get("name") as string;
  const taxId = formData.get("taxId") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;

  if (!name) {
    throw new Error("Company name is required");
  }

  await db.update(organizations)
    .set({
      name,
      taxId: taxId || null,
      address: address || null,
      city: city || null,
      country: country || null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  revalidatePath("/settings");
  
  return { success: true };
}
