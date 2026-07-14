import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default async function ProjectsPage() {
  const allProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      createdAt: projects.createdAt,
      organizationName: organizations.name,
    })
    .from(projects)
    .innerJoin(organizations, eq(projects.organizationId, organizations.id))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage active service delivery for won deals.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          New Project
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium">Project Name</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Health</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {allProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No projects found. Win a deal to automatically create a project.
                </td>
              </tr>
            ) : (
              allProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{project.name}</td>
                  <td className="px-6 py-4">{project.organizationName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-gray-600 capitalize">
                      {project.status === "active" ? (
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-500" />
                      ) : (
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${project.health === "green" ? "bg-green-100 text-green-800" : 
                        project.health === "yellow" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"}`}
                    >
                      {project.health === "red" && <AlertCircleIcon className="w-3 h-3 mr-1" />}
                      {project.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/crm/projects/${project.id}`}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
