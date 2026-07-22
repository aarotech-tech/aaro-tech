import { db } from "@/db";
import { deliverables, projects, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileCheck, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";

export default async function DeliverableReviewsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch deliverables that are in review
  // The query enforces tenant isolation if an orgId exists, otherwise relies on role
  const reviewsQuery = db
    .select({
      id: deliverables.id,
      name: deliverables.name,
      status: deliverables.status,
      createdAt: deliverables.createdAt,
      projectName: projects.name,
      projectId: projects.id,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(deliverables)
    .innerJoin(projects, eq(deliverables.projectId, projects.id))
    .innerJoin(organizations, eq(projects.organizationId, organizations.id))
    .where(eq(deliverables.status, "in_review"))
    .orderBy(desc(deliverables.createdAt));

  const allReviews = await reviewsQuery;

  // Filter based on user's active organization in Clerk, if applicable
  // If the user is an internal staff (like a PM), they might not have a client orgId active, or they use an internal orgId.
  const authorizedReviews = orgId 
    ? allReviews.filter(r => r.organizationId === orgId) // Strict tenant isolation for clients if they access this view
    : allReviews; // Admin/Internal fallback (depends on global roles in middleware)

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Deliverable Reviews"
          description="Global queue of deliverables awaiting client approval or changes."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Delivery", href: "/delivery/projects" },
            { label: "Reviews" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <FilterBar 
            searchPlaceholder="Search deliverables..."
            hasFilters
            onSearch={() => {}}
            onFilterClick={() => {}}
          />
        
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliverable
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Organization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {authorizedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div className="ml-4 font-medium text-gray-900">{review.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/delivery/projects/${review.projectId}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                      {review.projectName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/directory/organizations/${review.organizationId}`} className="text-gray-900 hover:text-indigo-600 transition-colors">
                      {review.organizationName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 capitalize">
                      {review.status ? review.status.replace('_', ' ') : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/delivery/projects/${review.projectId}/deliverables/${review.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Review details
                    </Link>
                  </td>
                </tr>
              ))}
              
              {authorizedReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-48 p-0">
                    <div className="flex justify-center p-8">
                      <EmptyState
                        icon={FileCheck}
                        title="No reviews pending"
                        description="There are no deliverables currently waiting for review."
                      />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
