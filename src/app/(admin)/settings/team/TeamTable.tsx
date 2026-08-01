"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateUserRoleAction, toggleUserStatusAction } from "@/modules/core/actions";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";

export function TeamTable({ team }: { team: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const res = await updateUserRoleAction({ userId, globalRole: newRole });
      if (res?.data) toast.success("Role updated");
      else toast.error("Failed to update role");
    } catch {
      toast.error("Error updating role");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    setIsUpdating(userId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await toggleUserStatusAction({ userId, status: newStatus });
      if (res?.data) toast.success(`User ${newStatus}`);
      else toast.error("Failed to update status");
    } catch {
      toast.error("Error updating status");
    } finally {
      setIsUpdating(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900">{row.original.name}</span>
          {row.original.status === 'suspended' && (
            <Badge variant="destructive" className="ml-2 text-[10px] uppercase">Suspended</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => (
        <Badge variant={row.original.globalRole === 'owner' ? 'default' : 'secondary'} className="capitalize">
          {row.original.globalRole || "staff"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isUpdating === row.original.id}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "owner")}>
                Make Owner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "admin")}>
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(row.original.id, "staff")}>
                Make Staff
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusToggle(row.original.id, row.original.status)}
                className={row.original.status === 'active' ? "text-red-600" : "text-green-600"}
              >
                {row.original.status === 'active' ? "Suspend User" : "Activate User"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={team}
      searchKey="name"
      searchPlaceholder="Search team..."
      enableExport={false}
      emptyMessage="No team members found."
    />
  );
}
