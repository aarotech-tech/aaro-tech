import { ReactNode } from "react";
import { AdminShell } from "../_components/AdminShell";
import { workspacesConfig } from "@/lib/constants/navigation";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell config={workspacesConfig.finance}>
      {children}
    </AdminShell>
  );
}
