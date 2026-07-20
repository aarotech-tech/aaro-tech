import { db } from "@/db";
import { projects, organizations, tasks, files, deliverables } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import FileUploader from "./_components/FileUploader";
import DeliverablesList from "./_components/DeliverablesList";
import { FileIcon, ListTodoIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const projectData = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      health: projects.health,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(projects)
    .innerJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  if (projectData.length === 0) {
    notFound();
  }
  const project = projectData[0];

  const projectTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: [desc(tasks.createdAt)]
  });

  const projectFiles = await db.query.files.findMany({
    where: eq(files.projectId, projectId), // We need to update FileUploader to associate to project later, or fetch org files
    orderBy: [desc(files.createdAt)]
  });

  const projectDeliverables = await db.query.deliverables.findMany({
    where: eq(deliverables.projectId, projectId),
    orderBy: [desc(deliverables.createdAt)]
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <Link href="/crm/projects" className="text-indigo-600 hover:underline text-sm mb-4 inline-flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
          {project.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
          <span className="font-semibold text-gray-700">{project.organizationName}</span>
          <span>•</span>
          <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold">{project.status}</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${project.health === 'green' ? 'bg-green-100 text-green-800' :
              project.health === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
            {project.health}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ListTodoIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Project Tasks
          </h3>
          {projectTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks found. Add a task to start tracking work.</p>
          ) : (
            <div className="space-y-4">
              {projectTasks.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{t.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Status: {t.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FileIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Project Files
          </h3>
          <FileUploader endpoint="projectUploader" />

          <div className="mt-8 space-y-4">
            {projectFiles.length === 0 ? (
              <p className="text-gray-500 text-sm">No files uploaded yet.</p>
            ) : (
              projectFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center">
                    <FileIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <a href={file.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                        {file.name}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{file.createdAt?.toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="lg:col-span-2">
          <DeliverablesList projectId={projectId} deliverables={projectDeliverables} />
        </div>
      </div>
    </div>
  );
}
