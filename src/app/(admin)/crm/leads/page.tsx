import { db } from "@/db";
import { websiteLeads } from "@/db/schema";
import { desc } from "drizzle-orm";
import PromoteLeadButton from "./_components/PromoteLeadButton";

export default async function LeadsDashboard(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const allLeads = await db
    .select()
    .from(websiteLeads)
    .orderBy(desc(websiteLeads.updatedAt))
    .limit(limit)
    .offset(offset);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Website Leads</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage incoming contact form submissions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4">Challenge</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No leads found. When users submit the contact form, they will appear here.
                  </td>
                </tr>
              ) : (
                allLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.businessName || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.phone || "-"}</td>
                    <td className="px-6 py-4 text-blue-600">
                      {lead.websiteUrl ? (
                        <a href={lead.websiteUrl.startsWith('http') ? lead.websiteUrl : `https://${lead.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Link
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={lead.challenge || ""}>
                      {lead.challenge || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'promoted' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.status !== "promoted" && (
                        <PromoteLeadButton leadId={lead.id} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            Showing Page {page}
          </span>
          <div className="space-x-2">
            {page > 1 && (
              <a href={`/crm/leads?page=${page - 1}`} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </a>
            )}
            {allLeads.length === 10 && (
              <a href={`/crm/leads?page=${page + 1}`} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Next
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
