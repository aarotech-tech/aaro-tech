import { db } from "@/db";
import { projects, tasks, users, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TASK_STATUSES } from "@/lib/constants/delivery";
import { TaskBoard } from "../TaskBoard";
import { KanbanColumn } from "@/components/ui/kanban";
import { notFound } from "next/navigation";

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [project] = await db
    .select({
      id: projects.id,
      organizationId: projects.organizationId,
    })
    .from(projects)
    .where(eq(projects.id, resolvedParams.id));

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
    .where(eq(tasks.projectId, resolvedParams.id));

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

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Task Board</h2>
        {/* We can add a "Create Task" button here later */}
      </div>
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-md">
        <TaskBoard 
          initialColumns={initialColumns} 
          projectId={project.id} 
          organizationId={project.organizationId} 
        />
      </div>
    </div>
  );
}
