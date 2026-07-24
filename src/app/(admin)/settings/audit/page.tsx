import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";

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

  const columns = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "entityType",
      header: "Entity",
      cell: ({ row }: any) => <span className="capitalize">{row.original.entityType}</span>,
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }: any) => {
        const u = row.original.user;
        if (!u) return <span className="text-gray-500">System</span>;
        return <span>{u.firstName} {u.lastName} ({u.email})</span>;
      }
    }
  ];

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
        <DataTable
          columns={columns}
          data={logs}
          searchKey="action"
          searchPlaceholder="Search actions..."
        />
      </div>
    </div>
  );
}
