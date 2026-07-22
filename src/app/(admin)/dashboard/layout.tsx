import { workspacesConfig } from "@/lib/constants/navigation";
import { AdminShell } from "../_components/AdminShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell config={workspacesConfig.dashboard}>
      {children}
    </AdminShell>
  );
}
