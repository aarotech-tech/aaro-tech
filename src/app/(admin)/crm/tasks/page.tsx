import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CircleIcon, ClockIcon } from "lucide-react";

export default async function TasksPage() {
  const allTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      dueDate: tasks.dueDate,
      projectName: projects.name,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .orderBy(desc(tasks.createdAt));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your action items across all projects.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          Add Task
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {allTasks.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No tasks assigned to you. Enjoy your day!
            </li>
          ) : (
            allTasks.map((task) => (
              <li key={task.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-green-500 transition-colors">
                    {task.status === "done" ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <CircleIcon className="w-6 h-6" />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{task.projectName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {task.dueDate && (
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {task.dueDate.toLocaleDateString()}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${task.status === "todo" ? "bg-gray-100 text-gray-800" : 
                      task.status === "in_progress" ? "bg-blue-100 text-blue-800" : 
                      "bg-green-100 text-green-800"}`}
                  >
                    {task.status?.replace("_", " ") ?? "No Status"}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
