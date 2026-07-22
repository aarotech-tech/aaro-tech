import { db } from "@/db";
import { invoices, organizations, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordPaymentButton } from "./_components/RecordPaymentButton";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";

export default async function InvoicesPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const invoicesQuery = db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      status: invoices.status,
      createdAt: invoices.createdAt,
      dueDate: invoices.dueDate,
      organizationName: organizations.name,
      organizationId: organizations.id,
      projectName: projects.name,
      projectId: projects.id,
    })
    .from(invoices)
    .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .orderBy(desc(invoices.createdAt));

  const allInvoices = await invoicesQuery;

  // Filter based on user's active organization in Clerk, if applicable
  const authorizedInvoices = orgId 
    ? allInvoices.filter(i => i.organizationId === orgId) 
    : allInvoices;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Invoices"
          description="Manage all client invoices."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Invoices" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <FilterBar 
            searchPlaceholder="Search invoices..."
            hasFilters
            onSearch={() => {}}
            onFilterClick={() => {}}
          />
        
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {authorizedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900 font-mono">
                        {inv.id.split('-')[0]}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/directory/organizations/${inv.organizationId}`} className="text-gray-900 hover:text-indigo-600 transition-colors font-medium">
                      {inv.organizationName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inv.projectId ? (
                      <Link href={`/delivery/projects/${inv.projectId}`} className="text-gray-500 hover:text-indigo-600 transition-colors">
                        {inv.projectName}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(inv.amount / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                      ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        inv.status === 'open' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {inv.status === 'open' && (
                      <RecordPaymentButton invoiceId={inv.id} />
                    )}
                  </td>
                </tr>
              ))}
              
              {authorizedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-48 p-0">
                    <div className="flex justify-center p-8">
                      <EmptyState
                        icon={Receipt}
                        title="No invoices found"
                        description="There are currently no invoices in the system."
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
