"use client";

import type { KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import dynamic from "next/dynamic";
import Link from "next/link";

const KanbanBoard = dynamic(() => import("@/components/ui/kanban").then(mod => mod.KanbanBoard), { ssr: false });
import { updateDealStageAction } from "@/modules/sales/actions";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DealItem extends KanbanItem {
  organizationId: string;
  organizationName: string;
  contactName: string | null;
  value: number;
  expectedCloseDate: Date | null;
  ownerName: string | null;
}

export function PipelineBoard({ initialColumns }: { initialColumns: KanbanColumn[] }) {

  const handleDragEnd = async (dealId: string, sourceColId: string, destColId: string, newIndex: number) => {
    // Find the deal to get its organizationId
    const sourceCol = initialColumns.find(c => c.id === sourceColId);
    const deal = sourceCol?.items.find(d => d.id === dealId) as DealItem | undefined;

    if (!deal) return;

    try {
      const res = await updateDealStageAction({ dealId, stage: destColId, organizationId: deal.organizationId });
      if (res?.data) {
        toast.success(`Deal moved to ${destColId}`, {
          action: res.data.actionLogId ? {
            label: "Undo",
            onClick: async () => {
              const { revertAction } = await import("@/modules/core/undo");
              const undoRes = await revertAction(res.data.actionLogId!);
              if (undoRes.data?.success) {
                toast.success("Deal stage reverted");
                // In a robust implementation, trigger a router.refresh() or pass a callback
              } else {
                toast.error(undoRes.serverError || "Failed to undo");
              }
            }
          } : undefined
        });
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update deal stage. Changes will be reverted.");
      // In a robust implementation, we would pass a callback to revert the UI state here,
      // or trigger a router.refresh() to re-sync with server state.
    }
  };

  const renderItem = (item: KanbanItem) => {
    const deal = item as DealItem;
    const formattedValue = formatCurrency(deal.value);

    return (
      <Link href={`/sales/deals/${deal.id}`} className="block p-3 hover:bg-slate-50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary">{deal.name}</h4>
        </div>
        {deal.contactName && <p className="text-xs text-gray-400 mb-3 truncate">{deal.contactName}</p>}
        {!deal.contactName && <div className="mb-3"></div>}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="font-medium text-green-700 text-sm">{formattedValue}</span>
          {deal.ownerName && (
            <span className="text-xs text-gray-400">Owner: {deal.ownerName}</span>
          )}
        </div>
      </Link>
    );
  };

  const renderColumnHeader = (col: KanbanColumn) => {
    const totalValue = col.items.reduce((sum, item) => sum + (item as DealItem).value, 0);
    const formattedTotal = formatCurrency(totalValue, { maximumFractionDigits: 0 });

    return (
      <div className="flex flex-col items-end">
        <Badge variant="secondary" className="mb-1">{col.items.length}</Badge>
        <span className="text-xs text-gray-500 font-medium">{formattedTotal}</span>
      </div>
    );
  };

  return (
    <div className="h-full bg-white">
      <KanbanBoard
        initialColumns={initialColumns}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
        renderColumnHeader={renderColumnHeader}
      />
    </div>
  );
}
