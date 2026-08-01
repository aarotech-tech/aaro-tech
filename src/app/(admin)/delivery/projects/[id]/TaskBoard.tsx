"use client";

import { useState } from "react";
import type { KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import dynamic from "next/dynamic";
import { getTaskDetailsAction, updateTaskStatusAction, bulkUpdateTaskStatusAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckSquare } from "lucide-react";
import { TASK_STATUSES } from "@/lib/constants/delivery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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

  const handleBulkUpdate = async (statusId: string) => {
    if (selectedTaskIds.size === 0) return;
    
    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateTaskStatusAction({ 
        taskIds: Array.from(selectedTaskIds), 
        status: statusId, 
        projectId, 
        organizationId 
      });
      if (res?.data?.success) {
        toast.success(`Updated ${selectedTaskIds.size} tasks to ${statusId}`);
        setSelectedTaskIds(new Set());
      } else {
        throw new Error("Bulk update failed");
      }
    } catch (err) {
      toast.error("Failed to bulk update tasks.");
    } finally {
      setIsBulkUpdating(false);
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
        className="p-3 cursor-pointer group" 
        onClick={() => handleTaskClick(task.id)}
      >
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">{task.title}</h4>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <Checkbox 
              checked={selectedTaskIds.has(task.id)}
              onCheckedChange={(checked) => {
                setSelectedTaskIds(prev => {
                  const next = new Set(prev);
                  if (checked) next.add(task.id);
                  else next.delete(task.id);
                  return next;
                });
              }}
            />
          </div>
        </div>
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
    <div className="h-full bg-white border border-gray-200 rounded-md flex flex-col">
      {selectedTaskIds.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-between">
          <div className="flex items-center text-blue-700 text-sm font-medium">
            <CheckSquare className="w-4 h-4 mr-2" />
            {selectedTaskIds.size} tasks selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTaskIds(new Set())} className="text-blue-600 hover:text-blue-800">
              Clear
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="bg-white" disabled={isBulkUpdating}>
                  {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Move to Stage...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TASK_STATUSES.map(status => (
                  <DropdownMenuItem key={status.id} onClick={() => handleBulkUpdate(status.id)}>
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          initialColumns={initialColumns} 
          onDragEnd={handleDragEnd} 
          renderItem={renderItem}
        />
      </div>

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
