"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";

export function ProjectsTable({ projects }: { projects: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">
          <Link href={`/delivery/projects/${row.original.id}`}>{row.original.name}</Link>
        </span>
      ),
    },
    {
      accessorKey: "organizationName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({ row }) => row.original.organizationName,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "health",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Health" />,
      cell: ({ row }) => (
        <Badge 
          variant={row.original.health === 'green' ? 'default' : row.original.health === 'yellow' ? 'secondary' : 'destructive'} 
          className="capitalize"
        >
          {row.original.health}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.value || 0)}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={projects}
      searchKey="name"
      searchPlaceholder="Search projects..."
      enableExport={true}
      exportFilename="projects"
      emptyMessage="No active projects found. Win a deal to create one!"
    />
  );
}
