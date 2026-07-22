import { requireAuthenticatedUser } from "@/lib/auth";
import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { notificationService } from "@/modules/core/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Activity } from "lucide-react";
import { InboxClient } from "@/app/(admin)/inbox/InboxClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientNotificationsPage() {
  const user = await requireAuthenticatedUser();
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (!membership) redirect("/onboarding");
  
  const orgId = membership.organizationId;
  const feed = await notificationService.getClientDashboardFeed(orgId);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title="Notifications"
          description="Stay up to date with project activity and alerts."
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Notifications" }
          ]}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full">

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <CardTitle className="text-lg flex items-center">
            <Bell className="w-5 h-5 mr-2 text-indigo-600" />
            All Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <InboxClient allNotifications={feed.notifications} />
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
