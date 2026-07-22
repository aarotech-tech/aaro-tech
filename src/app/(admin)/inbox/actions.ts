"use server";

import { requireAuthenticatedUser } from "@/lib/auth";
import { notificationService } from "@/modules/core/notifications";
import { revalidatePath } from "next/cache";

export async function markAsRead(notificationId: string) {
  const user = await requireAuthenticatedUser();
  await notificationService.markAsRead(user.id, notificationId);
  revalidatePath("/(admin)/inbox", "page");
  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(client)/portal/notifications", "page");
  revalidatePath("/(client)/portal/home", "page");
}

export async function markAllAsRead() {
  const user = await requireAuthenticatedUser();
  await notificationService.markAllAsRead(user.id);
  revalidatePath("/(admin)/inbox", "page");
  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(client)/portal/notifications", "page");
  revalidatePath("/(client)/portal/home", "page");
}

export async function archiveNotification(notificationId: string) {
  const user = await requireAuthenticatedUser();
  await notificationService.archive(user.id, notificationId);
  revalidatePath("/(admin)/inbox", "page");
  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(client)/portal/notifications", "page");
  revalidatePath("/(client)/portal/home", "page");
}
