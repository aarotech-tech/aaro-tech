import { ReactNode } from "react";
import { AdminShell } from "../_components/AdminShell";
import { workspacesConfig } from "@/lib/constants/navigation";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell configId="settings">
      {children}
    </AdminShell>
  );
}
