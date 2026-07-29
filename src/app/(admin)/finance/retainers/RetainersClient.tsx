"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export function RetainersClient({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "name",
      header: "Retainer",
      cell: ({ row }: any) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      accessorKey: "organization",
      header: "Client",
      cell: ({ row }: any) => row.original.organization.name,
    },
    {
      accessorKey: "amount",
      header: "MRR",
      cell: ({ row }: any) => (row.original.amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const s = row.original.status;
        const color = 
          s === "active" ? "bg-emerald-100 text-emerald-800" :
          s === "paused" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800";
        return (
          <Badge variant="secondary" className={color}>
            {s}
          </Badge>
        );
      }
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }: any) => new Date(row.original.startDate).toLocaleDateString(),
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search retainers..."
    />
  );
}
