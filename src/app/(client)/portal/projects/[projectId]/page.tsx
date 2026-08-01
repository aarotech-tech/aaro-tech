import { requireAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientProjectDetails } from "@/modules/delivery/client-services";
import { portalService } from "@/modules/portal/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Check, FileText, AlertCircle, TrendingUp, BarChart2 } from "lucide-react";
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

  // Task Board Summary
  const tasksByStatus = {
    todo: project.tasks.filter(t => t.status === 'todo' || t.status === 'backlog').length,
    in_progress: project.tasks.filter(t => t.status === 'in_progress').length,
    review: project.tasks.filter(t => t.status === 'review').length,
    completed: project.tasks.filter(t => t.status === 'completed').length,
  };
  const totalTasks = project.tasks.length;

  // Project Health Indicator
  const overdueTasks = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const healthStatus = overdueTasks > 0 ? 'at_risk' : project.status === 'active' ? 'on_track' : (project.status || 'on_track');
  
  const healthColors: Record<string, string> = {
    'on_track': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'at_risk': 'bg-amber-100 text-amber-800 border-amber-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200',
    'on_hold': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  const healthLabels: Record<string, string> = {
    'on_track': 'On Track',
    'at_risk': 'At Risk',
    'completed': 'Completed',
    'on_hold': 'On Hold'
  };

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
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide border ${healthColors[healthStatus] || healthColors['on_track']}`}>
                {healthLabels[healthStatus] || 'On Track'}
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold uppercase tracking-wide">
                {project.status}
              </span>
            </div>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-6xl mx-auto w-full mt-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Task Board Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-gray-500" /> Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalTasks === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tasks tracked for this project.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex w-full h-4 rounded-full overflow-hidden bg-gray-100">
                    <div className="bg-green-500" style={{ width: `${(tasksByStatus.completed / totalTasks) * 100}%` }} title={`Completed: ${tasksByStatus.completed}`} />
                    <div className="bg-amber-400" style={{ width: `${(tasksByStatus.review / totalTasks) * 100}%` }} title={`Review: ${tasksByStatus.review}`} />
                    <div className="bg-blue-500" style={{ width: `${(tasksByStatus.in_progress / totalTasks) * 100}%` }} title={`In Progress: ${tasksByStatus.in_progress}`} />
                    <div className="bg-gray-300" style={{ width: `${(tasksByStatus.todo / totalTasks) * 100}%` }} title={`To Do: ${tasksByStatus.todo}`} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">{tasksByStatus.todo}</div>
                      <div className="text-xs text-gray-500">To Do</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{tasksByStatus.in_progress}</div>
                      <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{tasksByStatus.review}</div>
                      <div className="text-xs text-gray-500">Review</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{tasksByStatus.completed}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
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
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent pt-2">
                  {project.milestones.map((m) => (
                    <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${m.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                        {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold text-base ${m.status === 'completed' ? 'text-gray-900 line-through opacity-70' : 'text-gray-900'}`}>{m.name}</h4>
                          <Badge variant={m.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{m.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
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
