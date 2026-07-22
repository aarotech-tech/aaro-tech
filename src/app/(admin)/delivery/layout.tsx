import { ReactNode } from "react";
import { AdminShell } from "../_components/AdminShell";
import { workspacesConfig } from "@/lib/constants/navigation";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell config={workspacesConfig.delivery}>
      {children}
    </AdminShell>
  );
}
