import { db } from "@/db";
import { projects, tasks, deliverables, users, organizations, activityLogs } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TASK_STATUSES } from "@/lib/constants/delivery";
import { TaskBoard } from "./TaskBoard";
import { KanbanColumn } from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Activity } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";
import { CreateDeliverableModal } from "./_components/CreateDeliverableModal";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch Overview Data (Deliverables, etc)
  const projectDeliverables = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.projectId, resolvedParams.id));

  const projectTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .where(eq(tasks.projectId, resolvedParams.id))
    .limit(5);

  const activities = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      createdAt: activityLogs.createdAt,
      userName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(and(
      eq(activityLogs.entityType, 'project'),
      eq(activityLogs.entityId, resolvedParams.id)
    ))
    .orderBy(desc(activityLogs.createdAt))
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Recent Tasks</h3>
            <div className="bg-white border border-gray-200 rounded-md p-0 overflow-hidden">
              {projectTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No tasks found.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {projectTasks.map(t => (
                    <li key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-5 h-5 ${t.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`font-medium ${t.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{t.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {t.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <Badge variant="outline" className="capitalize text-xs">{t.status?.replace("_", " ")}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Recent Activity</h3>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
              ) : (
                <div className="relative border-l border-gray-200 ml-3 space-y-4 pb-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-6">
                      <span className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <Activity className="h-3 w-3 text-blue-600" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {activity.action.replace(/\./g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          by {activity.userName || "System"} • {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Deliverables</h3>
            <CreateDeliverableModal projectId={resolvedParams.id} />
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4 flex-1">
            {projectDeliverables.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No deliverables uploaded yet.</p>
            ) : (
              <ul className="space-y-4">
                {projectDeliverables.map(d => (
                  <li key={d.id} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-[10px]">{d.status?.replace("_", " ")}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
