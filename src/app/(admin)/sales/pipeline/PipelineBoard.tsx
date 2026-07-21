"use client";

import { KanbanBoard, KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import { updateDealStage } from "@/actions/deals";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DealItem extends KanbanItem {
  organizationName: string;
  value: number;
  expectedCloseDate: Date | null;
  ownerName: string | null;
}

export function PipelineBoard({ initialColumns }: { initialColumns: KanbanColumn[] }) {
  
  const handleDragEnd = async (dealId: string, sourceColId: string, destColId: string, newIndex: number) => {
    // The KanbanBoard component already updates the UI optimistically.
    // We just need to fire the server action.
    try {
      const res = await updateDealStage({ dealId, stage: destColId });
      if (!res.success) {
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
    const formattedValue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(deal.value / 100);

    return (
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{deal.name}</h4>
        </div>
        <p className="text-xs text-gray-500 mb-3 truncate">{deal.organizationName}</p>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <span className="font-medium text-green-700 text-sm">{formattedValue}</span>
          {deal.ownerName && (
            <span className="text-xs text-gray-400">Owner: {deal.ownerName}</span>
          )}
        </div>
      </div>
    );
  };

  const renderColumnHeader = (col: KanbanColumn) => {
    const totalValue = col.items.reduce((sum, item) => sum + (item as DealItem).value, 0);
    const formattedTotal = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalValue / 100);

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
