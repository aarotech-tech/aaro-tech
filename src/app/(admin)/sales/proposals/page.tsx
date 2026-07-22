import { db } from "@/db";
import { proposals, deals, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
export default async function ProposalsPage() {
  const allProposals = await db
    .select({
      id: proposals.id,
      status: proposals.status,
      createdAt: proposals.createdAt,
      dealName: deals.name,
      organizationName: organizations.name,
      value: deals.value,
    })
    .from(proposals)
    .innerJoin(deals, eq(proposals.dealId, deals.id))
    .innerJoin(organizations, eq(deals.organizationId, organizations.id));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Proposals"
          description="Manage Statements of Work and Client Agreements."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/sales/pipeline" },
            { label: "Proposals" }
          ]}
        />
      </div>
      <div className="flex-1 p-6 pt-0 overflow-y-auto">

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium">Deal</th>
              <th className="px-6 py-4 font-medium">Client / Lead</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {allProposals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No proposals generated yet. Go to a Deal to generate one.
                </td>
              </tr>
            ) : (
              allProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{proposal.dealName}</td>
                  <td className="px-6 py-4">{proposal.organizationName}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">${proposal.value?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${proposal.status === "draft" ? "bg-gray-100 text-gray-800" : 
                        proposal.status === "sent" ? "bg-blue-100 text-blue-800" : 
                        proposal.status === "accepted" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/sales/proposals/${proposal.id}`}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
