import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth";
import { AdminShell } from "./_components/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  if (user.userType !== "internal") {
    redirect("/portal");
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
