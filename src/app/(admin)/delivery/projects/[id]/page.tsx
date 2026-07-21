import { db } from "@/db";
import { projects, tasks, deliverables, users, organizations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { TASK_STATUSES } from "@/lib/constants/delivery";
import { TaskBoard } from "./TaskBoard";
import { KanbanColumn } from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      organizationName: organizations.name,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(eq(projects.id, params.id));

  if (!project) notFound();

  // Fetch Tasks
  const allTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      assigneeName: users.firstName,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.projectId, params.id));

  const initialColumns: KanbanColumn[] = TASK_STATUSES.map((stage) => {
    const stageTasks = allTasks.filter((t) => t.status === stage.id).map(t => ({
      ...t,
      priority: t.priority || "medium",
    }));

    return {
      id: stage.id,
      title: stage.label,
      items: stageTasks,
    };
  });

  // Fetch Deliverables
  const projectDeliverables = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.projectId, params.id));

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{project.organizationName}</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="capitalize">{project.status}</Badge>
          <Badge variant={project.health === 'green' ? 'default' : 'destructive'} className="capitalize">
            {project.health} Health
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Task Board */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Task Board</h3>
          <div className="flex-1 min-h-0">
            <TaskBoard initialColumns={initialColumns} />
          </div>
        </div>

        {/* Deliverables */}
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Deliverables</h3>
          <div className="bg-white border border-gray-200 rounded-md p-4 flex-1 overflow-y-auto">
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
