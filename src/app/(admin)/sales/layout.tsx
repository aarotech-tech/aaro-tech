import { ReactNode } from "react";
import { AdminShell } from "../_components/AdminShell";
import { workspacesConfig } from "@/lib/constants/navigation";

export default function SalesLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell config={workspacesConfig.sales}>
      {children}
    </AdminShell>
  );
}
