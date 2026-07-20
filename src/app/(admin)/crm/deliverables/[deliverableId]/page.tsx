import { db } from "@/db";
import { deliverables, deliverableVersions, comments, files, users, projects, retainers, retainerPeriods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import FileUploader from "../../projects/[projectId]/_components/FileUploader";
import { ArrowLeftIcon, MessageSquareIcon, HistoryIcon, FileIcon } from "lucide-react";

export default async function AdminDeliverablePage({ params }: { params: Promise<{ deliverableId: string }> }) {
  const resolvedParams = await params;
  const deliverableId = resolvedParams.deliverableId;

  // 1. Fetch Deliverable
  const deliverableData = await db.query.deliverables.findFirst({
    where: eq(deliverables.id, deliverableId),
  });

  if (!deliverableData) notFound();

  // 2. Fetch Versions with their files
  const versions = await db
    .select({
      id: deliverableVersions.id,
      versionNumber: deliverableVersions.versionNumber,
      reviewStatus: deliverableVersions.reviewStatus,
      createdAt: deliverableVersions.createdAt,
      fileName: files.name,
      fileUrl: files.url,
      fileSize: files.size
    })
    .from(deliverableVersions)
    .innerJoin(files, eq(deliverableVersions.fileId, files.id))
    .where(eq(deliverableVersions.deliverableId, deliverableId))
    .orderBy(desc(deliverableVersions.versionNumber));

  // 3. Fetch Comments
  const deliverableComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      visibility: comments.visibility,
      createdAt: comments.createdAt,
      userEmail: users.email
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.deliverableId, deliverableId))
    .orderBy(desc(comments.createdAt));

  const backLink = deliverableData.projectId 
    ? `/crm/projects/${deliverableData.projectId}` 
    : `/crm/retainers/${deliverableData.retainerPeriodId}`; // Actually retainer details

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <Link href={backLink} className="text-indigo-600 hover:underline text-sm mb-4 inline-flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {deliverableData.name}
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                deliverableData.status === 'approved' ? 'bg-green-100 text-green-800' : 
                deliverableData.status === 'changes_requested' ? 'bg-red-100 text-red-800' :
                deliverableData.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {deliverableData.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Upload New Version */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New Version</h3>
            {/* We will need to map this file to the deliverable using the file ID after upload. 
                For now we just reuse the generic uploader. We'll need a custom client wrapper to trigger the action. */}
            <FileUploader 
              endpoint="projectUploader" 
              projectId={deliverableData.projectId || undefined}
              retainerPeriodId={deliverableData.retainerPeriodId || undefined} 
            />
            <p className="text-xs text-gray-500 mt-2">Uploading a new version will supersede previous versions and reset the status to In Review.</p>
          </div>

          {/* Version History */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <HistoryIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Version History
            </h3>
            {versions.length === 0 ? (
              <p className="text-sm text-gray-500">No versions uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {versions.map(v => (
                  <div key={v.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900">v{v.versionNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          v.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          v.reviewStatus === 'superseded' ? 'bg-gray-200 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {v.reviewStatus}
                        </span>
                      </div>
                      <a href={v.fileUrl} target="_blank" rel="noreferrer" className="flex items-center mt-2 text-sm font-medium text-blue-600 hover:underline">
                        <FileIcon className="w-4 h-4 mr-1" />
                        {v.fileName}
                      </a>
                    </div>
                    <span className="text-xs text-gray-400">{v.createdAt?.toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquareIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Feedback
          </h3>
          <div className="space-y-6">
            {deliverableComments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              deliverableComments.map(c => (
                <div key={c.id} className="text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">{c.userEmail}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                      c.visibility === 'internal_only' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.visibility === 'internal_only' ? 'Internal' : 'Client'}
                    </span>
                  </div>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
