"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QualifyLeadDialog } from "./_components/QualifyLeadDialog";
import { ArchiveLeadDialog } from "./_components/ArchiveLeadDialog";
import { updateLeadStatusAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { MoreHorizontal, Sparkles, CheckCircle, Archive } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeadsTable({ leads }: { leads: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleMarkContacted = async (id: string) => {
    setIsUpdating(id);
    try {
      const res = await updateLeadStatusAction({ leadId: id, status: "contacted" });
      if (res?.data) {
        toast.success("Lead marked as contacted", {
          action: res.data.actionLogId ? {
            label: "Undo",
            onClick: async () => {
              const { revertAction } = await import("@/modules/core/undo");
              const undoRes = await revertAction(res.data.actionLogId!);
              if (undoRes.data?.success) {
                toast.success("Lead status reverted");
                router.refresh();
              } else {
                toast.error(undoRes.serverError || "Failed to undo");
              }
            }
          } : undefined
        });
        router.refresh();
      } else {
        toast.error(res?.serverError || "Failed to update lead");
      }
    } catch (err) {
      toast.error("Failed to update lead");
    } finally {
      setIsUpdating(null);
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
      accessorKey: "challenge",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Challenge" />,
      cell: ({ row }) => (
        <div className="text-sm max-w-[300px] whitespace-normal">
          {row.original.challenge || <span className="text-gray-400">-</span>}
        </div>
      ),
    },
    {
      accessorKey: "websiteUrl",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Website" />,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.websiteUrl ? (
            <a 
              href={row.original.websiteUrl.startsWith('http') ? row.original.websiteUrl : `https://${row.original.websiteUrl}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline inline-block break-all"
            >
              {row.original.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          ) : <span className="text-gray-400">-</span>}
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
      cell: ({ row }) => {
        const isNewOrContacted = row.original.status === 'new' || row.original.status === 'contacted';
        const isNew = row.original.status === 'new';
        
        // Use a local functional component or just use state in the main table?
        // Wait, React hooks can't be called conditionally or inside map. We should extract to a real component.
        return <LeadActionsCell row={row} isUpdating={isUpdating} handleMarkContacted={handleMarkContacted} />;
      },
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

function LeadActionsCell({ row, isUpdating, handleMarkContacted }: { row: any, isUpdating: string | null, handleMarkContacted: (id: string) => void }) {
  const [showQualify, setShowQualify] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const isNewOrContacted = row.original.status === 'new' || row.original.status === 'contacted';
  const isNew = row.original.status === 'new';

  return (
    <div className="flex justify-end items-center gap-2">
      {isNewOrContacted && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowQualify(true)}
          className="h-8 text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Qualify
        </Button>
      )}
      {isNew && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleMarkContacted(row.original.id)}
          disabled={isUpdating === row.original.id}
          className="h-8"
        >
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Contacted
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowArchive(true)} 
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Archive className="h-4 w-4" />
        <span className="sr-only">Archive</span>
      </Button>

      <QualifyLeadDialog 
        open={showQualify}
        onOpenChange={setShowQualify}
        leadId={row.original.id} 
        leadName={row.original.name} 
        businessName={row.original.businessName}
      />
      <ArchiveLeadDialog 
        open={showArchive}
        onOpenChange={setShowArchive}
        leadId={row.original.id} 
        leadName={row.original.name}
      />
    </div>
  );
}
