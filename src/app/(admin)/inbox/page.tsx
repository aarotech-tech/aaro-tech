import { notificationService } from "@/modules/core/notifications";
import { requireAuthenticatedUser } from "@/lib/auth";
import { InboxClient } from "./InboxClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function InboxPage() {
  const user = await requireAuthenticatedUser();
  const inboxFeed = await notificationService.getDashboardFeed(user.id);

  // Combine categories into a chronological list
  const allNotifications = [...inboxFeed.recentActivity, ...inboxFeed.pendingApprovals, ...inboxFeed.systemAlerts].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Inbox"
          description="Global Notification Center for all Operational Events."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Inbox" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <InboxClient allNotifications={allNotifications} />
        </div>
      </div>
      </div>
    </div>
  );
}
