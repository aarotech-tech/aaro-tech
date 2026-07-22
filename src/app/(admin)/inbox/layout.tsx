import { workspacesConfig } from "@/lib/constants/navigation";
import { AdminShell } from "../_components/AdminShell";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell config={workspacesConfig.inbox}>
      {children}
    </AdminShell>
  );
}
