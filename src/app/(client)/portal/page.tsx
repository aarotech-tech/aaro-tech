import { requireAuthenticatedUser } from "@/lib/auth";
import { withCache } from "@/lib/redis";
import { unstable_cache } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileIcon, CheckCircle, Briefcase, DollarSign, Bell, Activity, ArrowRight, Clock, FileWarning } from "lucide-react";
import { portalService } from "@/modules/portal/services";
import Link from "next/link";
import { formatPaiseToINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";

export default async function ClientDashboardPage() {
  const user = await requireAuthenticatedUser();

  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <EmptyState 
          icon={Briefcase}
          title="No Active Organization"
          description="You have not been assigned to a client organization yet. Please contact your account manager."
        />
      </div>
    );
  }

  const { myOrg } = membershipData;

  // Fetch client data
  const getCachedDashboardData = unstable_cache(
    async (orgId: string, userId: string) => {
      return portalService.getDashboardData(orgId, userId);
    },
    [`org:${myOrg.id}:clientDashboard`],
    {
      tags: [`org:${myOrg.id}:dashboard`],
      revalidate: 3600
    }
  );

  const { activeProjects, recentAssets, onboardingStatus, clientInvoices, inboxFeed } = await getCachedDashboardData(myOrg.id, user.id);

  const outstandingInvoices = clientInvoices.filter(i => ["open", "partially_paid", "overdue"].includes(i.status || ""));
  const overdueInvoices = outstandingInvoices.filter(i => new Date(i.dueDate) < new Date());
  
  // Note: We don't expose internal pipeline, leads, or deals here.
  // The focus is: What does the client need to do?

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName || "Client"}`}
        description={`Here is the latest status for ${myOrg.name}.`}
        primaryAction={
          outstandingInvoices.length > 0 ? (
            <Button render={<Link href="/portal/billing" />}>
              <DollarSign className="w-4 h-4 mr-2" /> Pay Invoices
            </Button>
          ) : undefined
        }
        secondaryActions={
          <Button variant="outline" render={<Link href="/portal/projects" />}>
            <Briefcase className="w-4 h-4 mr-2" /> View Projects
          </Button>
        }
      />

      {/* Action Required Banner (If Any) */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <FileWarning className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Payment Overdue</h3>
              <p className="text-sm text-red-700">You have {overdueInvoices.length} overdue invoice(s). Please arrange payment to avoid service disruption.</p>
            </div>
          </div>
          <Button variant="destructive" render={<Link href="/portal/billing" />}>
            View Invoices
          </Button>
        </div>
      )}

      {inboxFeed.pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Approvals Required</h3>
              <p className="text-sm text-amber-700">You have {inboxFeed.pendingApprovals.length} item(s) awaiting your review.</p>
            </div>
          </div>
          <Button variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-100" render={<Link href="/portal/reviews" />}>
            Review Now
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
                  {formatPaiseToINR(outstandingInvoices.reduce((acc, inv) => acc + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unread Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inboxFeed.unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist */}
      {onboardingStatus && onboardingStatus.length > 0 && (
        <Card className="shadow-sm border-blue-100 bg-blue-50/10">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingStatus.map(step => (
                <div key={step.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${step.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                      {step.completed && <CheckCircle className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${step.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {activeProjects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No active projects at this time.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <Badge variant="secondary" className="capitalize">{project.status}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: project.status === 'completed' ? '100%' : project.status === 'active' ? '50%' : '10%' }}></div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button variant="link" size="sm" className="h-auto p-0 text-indigo-600" render={<Link href={`/portal/projects/${project.id}`} />}>
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {activeProjects.length > 3 && (
            <div className="p-4 border-t bg-gray-50/50 mt-auto">
              <Button variant="outline" size="sm" className="w-full" render={<Link href="/portal/projects" />}>
                View All Projects
              </Button>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* Recent Assets */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <FileIcon className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No documents shared yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentAssets.map((asset) => (
                    <li key={asset.id} className="py-3 flex justify-between items-center group">
                      <div className="flex items-center">
                        <div className="bg-indigo-50 p-2 rounded-md mr-3 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          <FileIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.createdAt?.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" render={<a href={asset.fileUrl} target="_blank" rel="noreferrer" />}>
                        View
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-4 h-4 mr-2 text-gray-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inboxFeed.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {inboxFeed.recentActivity.slice(0, 4).map((activity: any) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700 leading-tight">
                          <span className="font-medium text-gray-900">{activity.type}</span>: {activity.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
