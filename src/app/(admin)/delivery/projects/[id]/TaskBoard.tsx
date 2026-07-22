"use client";

import type { KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import dynamic from "next/dynamic";

const KanbanBoard = dynamic(() => import("@/components/ui/kanban").then(mod => mod.KanbanBoard), { ssr: false });
import { updateTaskStatusAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TaskItem extends KanbanItem {
  title: string;
  priority: string;
  assigneeName: string | null;
}

export function TaskBoard({ initialColumns, projectId, organizationId }: { initialColumns: KanbanColumn[], projectId: string, organizationId: string }) {
  
  const handleDragEnd = async (taskId: string, sourceColId: string, destColId: string, newIndex: number) => {
    try {
      const res = await updateTaskStatusAction({ taskId, status: destColId, projectId, organizationId }); 
      if (!res?.data) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update task status.");
    }
  };

  const renderItem = (item: KanbanItem) => {
    const task = item as TaskItem;

    return (
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">{task.title}</h4>
        <div className="flex justify-between items-center mt-2">
          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'low' ? 'secondary' : 'default'} className="text-[10px]">
            {task.priority}
          </Badge>
          {task.assigneeName && (
            <span className="text-xs text-gray-500 font-medium">{task.assigneeName}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white border border-gray-200 rounded-md">
      <KanbanBoard 
        initialColumns={initialColumns} 
        onDragEnd={handleDragEnd} 
        renderItem={renderItem}
      />
    </div>
  );
}
