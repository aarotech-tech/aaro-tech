"use server";

import { db } from "@/db";
import { contacts } from "@/db/schema";
import { requireInternalUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createContact(formData: FormData) {
  await requireInternalUser();
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const organizationId = formData.get("organizationId") as string;
  
  if (!name || !email || !organizationId) return { success: false, error: "Missing required fields" };
  
  try {
    await db.insert(contacts).values({
      name,
      email,
      phone,
      organizationId,
    });
    
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create contact" };
  }
}
