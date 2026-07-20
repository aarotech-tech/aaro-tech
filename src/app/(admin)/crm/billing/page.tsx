import { db } from "@/db";
import { invoices, organizations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ReceiptIcon, PlusIcon } from "lucide-react";

export default async function BillingDashboardPage() {
  const allInvoices = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      orgName: organizations.name
    })
    .from(invoices)
    .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
    .orderBy(desc(invoices.createdAt));

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <ReceiptIcon className="w-8 h-8 mr-3 text-indigo-600" />
            Billing & Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-2">Manage agency revenue and client payments.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {allInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No invoices generated yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inv.orgName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${(inv.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      inv.status === 'void' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inv.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/crm/billing/${inv.id}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded">
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
