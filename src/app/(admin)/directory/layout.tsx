import { ReactNode } from "react";
import { AdminShell } from "../_components/AdminShell";
import { workspacesConfig } from "@/lib/constants/navigation";

export default function DirectoryLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell configId="directory">
      {children}
    </AdminShell>
  );
}
