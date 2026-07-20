import { db } from "@/db";
import { deliverables, deliverableVersions, files, comments, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewActions from "./_components/ReviewActions";
import { ArrowLeftIcon, FileIcon, MessageSquareIcon } from "lucide-react";

export default async function ClientDeliverableDetailsPage({ params }: { params: Promise<{ deliverableId: string }> }) {
  const resolvedParams = await params;
  const deliverableId = resolvedParams.deliverableId;

  // 1. Fetch Deliverable
  const deliverableData = await db.query.deliverables.findFirst({
    where: eq(deliverables.id, deliverableId)
  });

  if (!deliverableData) notFound();

  // 2. Fetch Latest Version
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

  const latestVersion = versions[0]; // the latest version is at index 0

  // 3. Fetch Client-Visible Comments
  const visibleComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      userEmail: users.email,
      userFirstName: users.firstName,
      userType: users.userType
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(
      eq(comments.deliverableId, deliverableId),
      eq(comments.visibility, "client_visible")
    ))
    .orderBy(desc(comments.createdAt));

  const needsReview = latestVersion?.reviewStatus === "submitted" || latestVersion?.reviewStatus === "changes_requested";

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <Link href="/portal/deliverables" className="text-blue-400 hover:underline text-sm mb-4 inline-flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Deliverables
        </Link>
        <div className="mt-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {deliverableData.name}
          </h1>
          <p className="text-sm text-gray-400 mt-2 flex items-center space-x-3">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
              deliverableData.status === 'in_review' ? 'bg-yellow-900/50 text-yellow-400' :
              deliverableData.status === 'approved' ? 'bg-green-900/50 text-green-400' :
              deliverableData.status === 'changes_requested' ? 'bg-red-900/50 text-red-400' :
              'bg-gray-800 text-gray-400'
            }`}>
              {deliverableData.status?.replace('_', ' ') || 'Unknown'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Latest Version</h3>
            
            {!latestVersion ? (
              <p className="text-gray-500 text-sm">Our team has not uploaded the first version yet. Check back soon!</p>
            ) : (
              <div>
                <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center">
                    <FileIcon className="w-8 h-8 text-blue-500 mr-4" />
                    <div>
                      <h4 className="text-gray-200 font-medium">{latestVersion.fileName}</h4>
                      <p className="text-gray-500 text-xs mt-1">Version {latestVersion.versionNumber} • {(latestVersion.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <a href={latestVersion.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm font-medium hover:underline">
                    Download &rarr;
                  </a>
                </div>

                {needsReview && (
                  <ReviewActions deliverableId={deliverableId} versionId={latestVersion.id} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Feedback */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <MessageSquareIcon className="w-5 h-5 mr-2 text-blue-500" />
            Feedback History
          </h3>
          <div className="space-y-6">
            {visibleComments.length === 0 ? (
              <p className="text-sm text-gray-500">No feedback has been left yet.</p>
            ) : (
              visibleComments.map(c => (
                <div key={c.id} className="text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-200">{c.userFirstName || c.userEmail}</span>
                    <span className="text-[10px] text-gray-500">{c.createdAt?.toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-400 mt-1">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
