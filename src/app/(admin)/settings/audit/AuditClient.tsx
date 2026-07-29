"use client";

import { DataTable } from "@/components/ui/data-table";

export function AuditClient({ logs }: { logs: any[] }) {
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
    <DataTable
      columns={columns}
      data={logs}
      searchKey="action"
      searchPlaceholder="Search actions..."
    />
  );
}
