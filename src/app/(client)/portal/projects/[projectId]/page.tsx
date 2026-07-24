import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProjectDetails } from "@/modules/delivery/client-services";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Check, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";

export default async function ClientProjectWorkspacePage(props: { params: Promise<{ projectId: string }> }) {
  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);

  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const resolvedParams = await props.params;
  const project = await getClientProjectDetails(resolvedParams.projectId, membershipData.myOrg.id);

  if (!project) {
    return <div className="p-12 text-center text-gray-500">Project not found or access denied.</div>;
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
  const progress = project.milestones.length > 0 ? Math.round((completedMilestones / project.milestones.length) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-6xl mx-auto w-full">
        <PageHeader 
          title={project.name}
          description="Project Overview"
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Projects", href: "/portal/projects" },
            { label: project.name }
          ]}
          kpiBadges={
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold uppercase tracking-wide">
              {project.status}
            </span>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full mt-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress & Milestones */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between">
                <span>Milestones</span>
                <span className="text-sm font-normal text-gray-500">{progress}% Complete</span>
              </CardTitle>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            </CardHeader>
            <CardContent>
              {project.milestones.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No milestones scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {project.milestones.map((m) => (
                    <div key={m.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50/30">
                      <div className="flex items-center gap-3">
                        {m.status === 'completed' ? (
                          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                        ) : (
                          <Circle className="text-gray-300 w-5 h-5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${m.status === 'completed' ? 'text-gray-900 line-through opacity-70' : 'text-gray-900'}`}>{m.name}</h4>
                          <p className="text-xs text-gray-500">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'TBD'}</p>
                        </div>
                      </div>
                      <Badge variant={m.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {project.invoices.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No invoices issued.</p>
              ) : (
                <div className="space-y-3">
                  {project.invoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400 w-5 h-5" />
                        <div>
                          <h4 className="font-medium text-gray-900 font-mono text-sm">{inv.id.split('-')[0]}</h4>
                          <p className="text-xs text-gray-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(inv.amount)}
                        </span>
                        <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          {/* Activity Timeline */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {project.activities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                ) : (
                  project.activities.map((act) => (
                    <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-indigo-600 font-semibold">{act.action.replace(".", " ").toUpperCase()}</span>
                          <time className="text-[10px] text-gray-500">{new Date(act.createdAt || '').toLocaleDateString()}</time>
                        </div>
                        <div className="text-xs text-gray-700">
                          {act.metadata ? JSON.parse(act.metadata).title || JSON.parse(act.metadata).name || "Activity recorded" : "Action completed"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
