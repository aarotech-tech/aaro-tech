import { db } from "@/db";
import { projects, tasks, deliverables, users, organizations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { TASK_STATUSES } from "@/lib/constants/delivery";
import { TaskBoard } from "./TaskBoard";
import { KanbanColumn } from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch Overview Data (Deliverables, etc)
  const projectDeliverables = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.projectId, resolvedParams.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Project Overview</h3>
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <p className="text-gray-500">More overview widgets will be added here (e.g. open tasks, recent activity).</p>
          </div>
        </div>

        {/* Deliverables */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Deliverables</h3>
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
