"use client";

import { useState } from "react";
import type { KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import dynamic from "next/dynamic";
import { getTaskDetailsAction, updateTaskStatusAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

const KanbanBoard = dynamic(() => import("@/components/ui/kanban").then(mod => mod.KanbanBoard), { ssr: false });

interface TaskItem extends KanbanItem {
  title: string;
  priority: string;
  assigneeName: string | null;
}

export function TaskBoard({ initialColumns, projectId, organizationId }: { initialColumns: KanbanColumn[], projectId: string, organizationId: string }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  const handleTaskClick = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskDetails(null);
    setIsLoadingDetails(true);

    try {
      const res = await getTaskDetailsAction({ taskId, projectId, organizationId });
      if (res?.data) {
        setTaskDetails(res.data);
      } else {
        toast.error("Failed to load task details");
      }
    } catch (error) {
      toast.error("Failed to load task details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderItem = (item: KanbanItem) => {
    const task = item as TaskItem;

    return (
      <div 
        className="p-3 cursor-pointer" 
        onClick={() => handleTaskClick(task.id)}
      >
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

      <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        <SheetContent className="sm:max-w-[500px]">
          {isLoadingDetails ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : taskDetails ? (
            <>
              <SheetHeader>
                <SheetTitle>{taskDetails.title}</SheetTitle>
                <SheetDescription>
                  Status: <span className="capitalize font-medium">{taskDetails.status}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {taskDetails.description || "No description provided."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Assignee</h4>
                    <p className="text-sm text-gray-600">
                      {taskDetails.assignee 
                        ? `${taskDetails.assignee.firstName} ${taskDetails.assignee.lastName}`
                        : "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                    <Badge variant={taskDetails.priority === 'high' ? 'destructive' : taskDetails.priority === 'low' ? 'secondary' : 'default'} className="mt-1">
                      {taskDetails.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Due Date</h4>
                    <p className="text-sm text-gray-600">
                      {taskDetails.dueDate 
                        ? new Date(taskDetails.dueDate).toLocaleDateString() 
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Task not found
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
