"use client";

import { Activity } from "lucide-react";

interface DealActivityLogProps {
  activities: any[];
}

export function DealActivityLog({ activities }: DealActivityLogProps) {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet.</p>
      ) : (
        <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-6">
              <span className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Activity className="h-3 w-3 text-blue-600" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {activity.action.replace(/\./g, ' ')}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  by {activity.userName || "System"} • {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
