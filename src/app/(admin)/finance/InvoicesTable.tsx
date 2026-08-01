"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordPaymentButton } from "./_components/RecordPaymentButton";
import Link from "next/link";

export function InvoicesTable({ invoices }: { invoices: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice ID" />,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 font-mono text-sm">
          INV-{row.original.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "organizationName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({ row }) => row.original.organizationName,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-semibold">
          ${(row.original.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === 'paid' ? 'default' : 
            row.original.status === 'overdue' ? 'destructive' : 'secondary'
          } 
          className="capitalize"
        >
          {row.original.status?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
      cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right space-x-2">
          <Link href={`/finance/invoices/${row.original.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
          {row.original.status === 'open' && (
            <RecordPaymentButton invoiceId={row.original.id} />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      searchKey="organizationName"
      searchPlaceholder="Search clients..."
      enableExport={true}
      exportFilename="invoices"
      emptyMessage="No invoices found."
    />
  );
}
