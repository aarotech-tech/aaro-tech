"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pause, Play, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAction } from "next-safe-action/hooks";
import { updateRetainerStatusAction } from "@/modules/finance/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RetainersClient({ data }: { data: any[] }) {
  const router = useRouter();
  const { execute } = useAction(updateRetainerStatusAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        toast.success("Retainer status updated");
        router.refresh();
      }
    },
    onError: (err) => {
      toast.error("Failed to update status");
    }
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Retainer",
      cell: ({ row }: any) => (
        <Link href={`/finance/retainers/${row.original.id}`} className="font-medium text-indigo-600 hover:underline">
          {row.original.name}
        </Link>
      ),
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
          <Badge variant="secondary" className={color + " capitalize"}>
            {s}
          </Badge>
        );
      }
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }: any) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const retainer = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/finance/retainers/${retainer.id}`)}>
                View Details
              </DropdownMenuItem>
              {retainer.status === 'active' ? (
                <DropdownMenuItem onClick={() => execute({ retainerId: retainer.id, status: 'paused' })}>
                  <Pause className="w-4 h-4 mr-2" /> Pause Retainer
                </DropdownMenuItem>
              ) : retainer.status === 'paused' ? (
                <DropdownMenuItem onClick={() => execute({ retainerId: retainer.id, status: 'active' })}>
                  <Play className="w-4 h-4 mr-2" /> Resume Retainer
                </DropdownMenuItem>
              ) : null}
              {retainer.status !== 'cancelled' && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => execute({ retainerId: retainer.id, status: 'cancelled' })}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Retainer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
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
