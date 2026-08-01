"use client";

import { DataTable } from "@/components/ui/data-table";
import { ServiceDialog } from "./_components/ServiceDialog";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

export function ServicesClient({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }: any) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => <span className="text-gray-500 max-w-xs truncate">{row.original.description || "-"}</span>,
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }: any) => (row.original.basePrice / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <ServiceDialog 
            service={row.original} 
            trigger={
              <Button variant="ghost" size="icon">
                <Edit2 className="w-4 h-4 text-gray-500" />
              </Button>
            } 
          />
        </div>
      ),
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search services..."
    />
  );
}
