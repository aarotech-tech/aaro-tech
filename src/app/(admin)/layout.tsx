import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth";
import { AdminShell } from "./_components/AdminShell";
import { notificationService } from "@/modules/core/notifications";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  if (user.userType !== "internal") {
    redirect("/portal");
  }

  const feed = await notificationService.getDashboardFeed(user.id);

  return (
    <AdminShell unreadCount={feed.unreadCount}>
      {children}
    </AdminShell>
  );
}
