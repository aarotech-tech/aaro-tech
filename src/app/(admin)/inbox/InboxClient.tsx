"use client";

import { Bell, CheckCircle, Info, Archive, Check } from "lucide-react";
import { markAsRead, archiveNotification, markAllAsRead } from "./actions";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InboxClient({ allNotifications }: { allNotifications: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id);
      toast.success("Marked as read");
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      await archiveNotification(id);
      toast.success("Notification archived");
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    });
  };

  if (allNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
        <p>You're all caught up!</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-end">
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
          <Check className="h-4 w-4 mr-2" /> Mark all as read
        </Button>
      </div>
      <ul className="divide-y divide-gray-200">
        {allNotifications.map((notification) => (
          <li key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${notification.read === false ? 'bg-blue-50/50' : ''}`}>
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notification.read === false ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {notification.severity === 'warning' ? <Info className="h-5 w-5 text-red-500" /> : <Bell className="h-5 w-5" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.read === false ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  <span className="mr-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">{notification.type?.replace("Domain/", "") || "Alert"}</span>
                  {notification.message}
                </p>
                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                  <time dateTime={notification.createdAt instanceof Date ? notification.createdAt.toISOString() : notification.createdAt}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <Button variant="ghost" size="icon" onClick={() => handleMarkRead(notification.id)} disabled={isPending} title="Mark as read">
                    <Check className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleArchive(notification.id)} disabled={isPending} title="Archive">
                  <Archive className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
