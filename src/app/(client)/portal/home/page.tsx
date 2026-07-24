import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProjects } from "@/modules/delivery/services";
import { financeService } from "@/modules/finance/services";
import { notificationService } from "@/modules/core/notifications";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, ShieldCheck, CreditCard, Activity, ArrowRight, Download, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default async function ClientDashboardPage() {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const orgId = membershipData.myOrg.id;

  // Concurrent data fetching bounded to orgId
  const [projects, invoices, feed] = await Promise.all([
    getClientProjects(orgId),
    financeService.getClientInvoices(orgId),
    notificationService.getClientDashboardFeed(orgId)
  ]);

  const activeProjects = projects.filter((p: any) => p.status === "active");
  const outstandingInvoices = invoices.filter((i: any) => i.status === "open" || i.status === "partially_paid" || i.status === "overdue");

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title={`Welcome back, ${user.firstName}`}
          description="Here is what requires your attention today."
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-blue-50/50 hover:bg-blue-100 border-blue-200">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span>Review Deliverable</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-emerald-50/50 hover:bg-emerald-100 border-emerald-200">
          <CreditCard className="h-6 w-6 text-emerald-600" />
          <span>Pay Invoice</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-amber-50/50 hover:bg-amber-100 border-amber-200">
          <Download className="h-6 w-6 text-amber-600" />
          <span>Download Assets</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 bg-purple-50/50 hover:bg-purple-100 border-purple-200">
          <MessageSquare className="h-6 w-6 text-purple-600" />
          <span>Contact PM</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <FolderKanban className="w-5 h-5 mr-2 text-indigo-500" />
                Active Projects
              </CardTitle>
              <Link href="/portal/projects" className="text-sm text-indigo-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active projects at this time.</p>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project: any) => (
                    <div key={project.id} className="p-4 border rounded-lg bg-gray-50/50 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Next: {project.nextMilestone}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600">{project.progress}%</div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-500" />
                Outstanding Invoices
              </CardTitle>
              <Link href="/portal/billing" className="text-sm text-emerald-600 hover:underline">View Billing</Link>
            </CardHeader>
            <CardContent>
              {outstandingInvoices.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">You have no outstanding invoices.</p>
              ) : (
                <div className="space-y-3">
                  {outstandingInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg">
                      <div>
                        <p className="font-medium text-emerald-900">{invoice.number}</p>
                        <p className="text-xs text-emerald-600">Due: {new Date(invoice.dueAt as string).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-emerald-700">${(invoice.amountCents / 100).toFixed(2)}</span>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Pay Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="shadow-sm bg-blue-50/30 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Recent Activity
              </CardTitle>
              {feed.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {feed.unreadCount} New
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                {feed.notifications.map((notif: any) => (
                  <div key={notif.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <div>
                      <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/portal/notifications" className="block text-center text-sm text-blue-600 font-medium hover:underline mt-4">
                View all notifications →
              </Link>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
