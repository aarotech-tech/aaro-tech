import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { AuditClient } from "./AuditClient";

export default async function AuditLogsPage() {
  const logs = await db
    .select({
      id: auditLogs.id,
      entityType: auditLogs.entityType,
      action: auditLogs.action,
      createdAt: auditLogs.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      }
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Audit Logs"
          description="View all activity and changes across your organization."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Audit Logs" }
          ]}
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <AuditClient logs={logs} />
      </div>
    </div>
  );
}
