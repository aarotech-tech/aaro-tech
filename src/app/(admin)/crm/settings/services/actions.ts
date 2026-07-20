"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { requireInternalUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  await requireInternalUser();
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const basePrice = parseInt(formData.get("basePrice") as string) || 0;
  
  if (!name) return { success: false, error: "Name is required" };
  
  try {
    await db.insert(services).values({
      name,
      description,
      basePrice,
      isActive: true,
    });
    
    revalidatePath("/crm/settings/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create service" };
  }
}
