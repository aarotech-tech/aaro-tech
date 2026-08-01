import { getDashboardMetrics as getSalesMetrics } from "@/modules/sales/services";
import { getDashboardMetrics as getDeliveryMetrics } from "@/modules/delivery/services";
import { financeService } from "@/modules/finance/services";
import { notificationService } from "@/modules/core/notifications";
import { requireAuthenticatedUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock, Briefcase, DollarSign, Target, Bell, Users, PlusCircle, CheckCircle, FileCheck, Calendar, Activity, Settings2, FileText, FileWarning } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatPaiseToINR } from "@/lib/currency";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  
  // Concurrent fetching across bounded contexts
  const [salesMetrics, deliveryMetrics, financeMetrics, inboxFeed] = await Promise.all([
    getSalesMetrics(),
    getDeliveryMetrics(),
    financeService.getFinancialMetrics(),
    notificationService.getDashboardFeed(user.id)
  ]);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader
          title="Executive Command Center"
          description="Global aggregation across Sales, Delivery, and Finance."
          breadcrumbs={[
            { label: "Dashboard" }
          ]}
          primaryAction={
            <Button render={<Link href="/finance" />} nativeButton={false}>
              <PlusCircle className="w-4 h-4 mr-2" /> New Invoice
            </Button>
          }
          secondaryActions={
            <>
              <Button variant="outline" render={<Link href="/sales/pipeline" />} nativeButton={false}>
                <PlusCircle className="w-4 h-4 mr-2" /> New Deal
              </Button>
              <Button variant="outline" render={<Link href="/delivery/projects" />} nativeButton={false}>
                <PlusCircle className="w-4 h-4 mr-2" /> New Project
              </Button>
            </>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales KPI */}
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Sales & Pipeline</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPaiseToINR(salesMetrics.deals.pipelineValueCents)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {salesMetrics.websiteLeads.newToday} New Leads Today
            </p>
          </CardContent>
        </Card>
        
        {/* Delivery KPI */}
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Delivery Status</CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryMetrics.activeProjects} Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              {deliveryMetrics.projectsAtRisk > 0 ? (
                <span className="text-red-600 font-medium">{deliveryMetrics.projectsAtRisk} At Risk</span>
              ) : (
                "All projects on track"
              )}
            </p>
          </CardContent>
        </Card>
        
        {/* Finance KPI */}
        <Card className="shadow-sm border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Finance & Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPaiseToINR(financeMetrics.outstandingRevenueCents)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {financeMetrics.collectionRate * 100}% Collection Rate
            </p>
          </CardContent>
        </Card>

        {/* Ops KPI */}
        <Card className="shadow-sm border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Action Required</CardTitle>
            <Bell className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboxFeed.unreadCount} Alerts</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inboxFeed.pendingApprovals.length} Approvals Pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actionable Sales & Proposals */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-base"><Users className="w-5 h-5 mr-2 text-blue-600" /> Sales Attention</CardTitle>
                <CardDescription>Leads and pipeline requiring your input</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Awaiting Qualification</span>
                    </div>
                    <Badge variant="secondary">{salesMetrics.websiteLeads.awaitingQualification}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Proposals to Approve</span>
                    </div>
                    <Badge variant="secondary">{salesMetrics.proposals.draft}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium">Stalled Deals</span>
                    </div>
                    <Badge variant="secondary">{salesMetrics.deals.stalled}</Badge>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t bg-gray-50/50 mt-auto">
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/sales/leads" />} nativeButton={false}>
                  Review Pipeline →
                </Button>
              </div>
            </Card>

            {/* Actionable Delivery */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-base"><Briefcase className="w-5 h-5 mr-2 text-emerald-600" /> Delivery Attention</CardTitle>
                <CardDescription>Projects and tasks requiring your input</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Projects At Risk</span>
                    </div>
                    <Badge variant={deliveryMetrics.projectsAtRisk > 0 ? "destructive" : "secondary"}>
                      {deliveryMetrics.projectsAtRisk}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Overdue Tasks</span>
                    </div>
                    <Badge variant={deliveryMetrics.overdueTasks > 0 ? "destructive" : "secondary"}>
                      {deliveryMetrics.overdueTasks}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Deliverables for Review</span>
                    </div>
                    <Badge variant="secondary">{deliveryMetrics.deliverablesAwaitingReview}</Badge>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t bg-gray-50/50 mt-auto">
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/delivery/projects" />} nativeButton={false}>
                  Review Projects →
                </Button>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center"><FileWarning className="w-5 h-5 mr-2 text-amber-600" /> Finance Action Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 text-red-900 border border-red-100 rounded-md">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold">Overdue Payments</p>
                      <p className="text-xs text-red-700">{formatPaiseToINR(financeMetrics.overdueAmountCents)} across {financeMetrics.overdueInvoicesCount} invoices</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" render={<Link href="/finance/invoices?status=overdue" />} nativeButton={false}>
                    Chase Payments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm h-full flex flex-col border-purple-100 bg-purple-50/10">
            <CardHeader className="pb-3 border-b border-purple-100/50 bg-purple-50/30">
              <CardTitle className="text-base font-semibold text-purple-900 flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-purple-600" /> 
                  Priority Inbox
                </div>
                {inboxFeed.unreadCount > 0 && (
                  <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                    {inboxFeed.unreadCount} New
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <div className="space-y-4">
                {inboxFeed.systemAlerts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">System Alerts</h4>
                    <div className="space-y-2">
                      {inboxFeed.systemAlerts.map((alert: any) => (
                        <div key={alert.id} className="p-3 bg-red-50 rounded-md border border-red-100 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900 leading-tight">{alert.message}</p>
                            <p className="text-xs text-red-600 mt-1">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Approvals</h4>
                  <div className="space-y-2">
                    {inboxFeed.pendingApprovals.map((approval: any) => (
                      <div key={approval.id} className="p-3 bg-white rounded-md shadow-sm border border-gray-100 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight">{approval.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(approval.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {inboxFeed.pendingApprovals.length === 0 && (
                      <p className="text-sm text-gray-500 p-2 text-center bg-gray-50 rounded-md border border-dashed">
                        No pending approvals.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {inboxFeed.recentActivity.slice(0, 4).map((activity: any) => (
                      <div key={activity.id} className="flex gap-3 py-2 items-start">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-sm text-gray-700 leading-tight">
                            <span className="font-medium text-gray-900">{activity.type}</span>: {activity.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t bg-white mt-auto">
              <Button variant="outline" size="sm" className="w-full text-indigo-600" render={<Link href="/inbox" />} nativeButton={false}>
                Go to Inbox →
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
