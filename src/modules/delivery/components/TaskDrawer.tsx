"use client";

import { X, Calendar, Flag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeName?: string;
  description?: string;
}

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  // In a real implementation, we would fetch the task details based on the taskId
  // For this milestone, we'll accept an optional pre-fetched task object or fetch it here.
  task?: Task | null;
}

export function TaskDrawer({ isOpen, onClose, taskId, task }: TaskDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {taskId ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{task?.title || "Loading Task..."}</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                    task?.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                    task?.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {task?.status?.replace('_', ' ') || 'Todo'}
                  </span>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                    task?.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                    task?.priority === 'low' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task?.priority || 'Medium'}
                  </span>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Assignee</span>
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {task?.assigneeName || "Unassigned"}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Due Date</span>
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date set"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="block text-sm font-medium text-gray-900 mb-2">Description</span>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-4 min-h-[100px] border border-gray-100">
                  {task?.description || <span className="italic text-gray-400">No description provided.</span>}
                </div>
              </div>
              
              {/* Inline Activity Placeholder (Nice to have) */}
              <div className="pt-4">
                <span className="block text-sm font-medium text-gray-900 mb-4">Activity</span>
                <div className="space-y-4">
                  <div className="flex gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0 font-medium">
                      S
                    </div>
                    <div>
                      <p className="text-gray-900"><span className="font-medium">System</span> created this task</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No task selected
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="default">Save Changes</Button>
        </div>
      </div>
    </>
  );
}
