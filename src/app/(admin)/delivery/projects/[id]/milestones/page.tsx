import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

export default async function ProjectMilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const projectMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, resolvedParams.id))
    .orderBy(asc(milestones.dueDate));

  const completed = projectMilestones.filter(m => m.status === 'completed').length;
  const progress = projectMilestones.length > 0 ? Math.round((completed / projectMilestones.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Milestones</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Project Progress</span>
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{completed} of {projectMilestones.length} milestones completed</p>
        </div>

        {projectMilestones.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No milestones have been defined yet.</p>
        ) : (
          <ul className="space-y-4">
            {projectMilestones.map(m => (
              <li key={m.id} className="p-4 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{m.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No date set'}
                  </p>
                </div>
                <Badge variant={m.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                  {m.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
