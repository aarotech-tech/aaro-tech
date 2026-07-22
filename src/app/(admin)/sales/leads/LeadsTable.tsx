"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
import { qualifyLeadAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function LeadsTable({ leads }: { leads: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleQualify = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await qualifyLeadAction({ leadId: id });
      if (res?.data) {
        toast.success("Lead successfully qualified and added to Organizations.");
      } else {
        toast.error(res?.serverError || "Failed to qualify lead");
      }
    } catch (err) {
      toast.error("Failed to qualify lead");
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact / Business" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          {row.original.businessName && <div className="text-sm text-gray-500">{row.original.businessName}</div>}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Info" />,
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">{row.original.email}</div>
          {row.original.phone && <div className="text-sm text-gray-500">{row.original.phone}</div>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'new' ? 'secondary' : 'default'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.status === 'new' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQualify(row.original.id)}
              disabled={loadingId === row.original.id}
            >
              {loadingId === row.original.id ? "Qualifying..." : "Qualify Lead"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={leads}
      searchKey="name"
      searchPlaceholder="Search leads..."
      enableExport={true}
      exportFilename="website-leads"
      emptyMessage="You don't have any website leads pending qualification."
    />
  );
}
