import { db } from "@/db";
import { deliverables, projects, retainerPeriods, organizationMembers, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuthenticatedUser } from "@/lib/auth";
import Link from "next/link";
import { FileCheck2Icon } from "lucide-react";

export default async function ClientDeliverablesPage() {
  const user = await requireAuthenticatedUser();
  
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (!membership) return null;

  // We need to fetch deliverables that belong to projects OR retainer periods associated with this org.
  // We'll fetch the projects and retainer periods for this org first, then get the deliverables.
  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.organizationId, membership.organizationId)
  });

  // Retainers -> Retainer Periods (skipped for brevity in this simple fetch, we can just fetch all deliverables 
  // and join projects to filter by org, but drizzle doesn't natively support easy polymorphic joins).
  // A cleaner way for the demo:
  const allDeliverables = await db.select({
    id: deliverables.id,
    name: deliverables.name,
    status: deliverables.status,
    createdAt: deliverables.createdAt,
    projectName: projects.name
  })
  .from(deliverables)
  .leftJoin(projects, eq(deliverables.projectId, projects.id))
  // .leftJoin(retainerPeriods, ...) would go here
  .where(eq(projects.organizationId, membership.organizationId))
  .orderBy(desc(deliverables.createdAt));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <FileCheck2Icon className="w-8 h-8 mr-3 text-blue-500" />
            Deliverables
          </h1>
          <p className="text-gray-400 mt-2">
            Review and approve work submitted by our team.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {allDeliverables.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No deliverables to review at this time.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Deliverable Name</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allDeliverables.map(d => (
                <tr key={d.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-100">{d.name}</td>
                  <td className="px-6 py-4">{d.projectName || "Retainer Work"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      d.status === 'in_review' ? 'bg-yellow-900/50 text-yellow-400' :
                      d.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                      d.status === 'changes_requested' ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {d.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/portal/deliverables/${d.id}`} className="text-blue-400 hover:text-blue-300 font-medium bg-blue-900/20 px-4 py-2 rounded-md">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
