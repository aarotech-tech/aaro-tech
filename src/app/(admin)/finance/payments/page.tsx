import { db } from "@/db";
import { payments, invoices, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifyPaymentButton } from "./_components/VerifyPaymentButton";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";

export default async function PaymentsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const paymentsQuery = db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      provider: payments.provider,
      paidAt: payments.paidAt,
      referenceNumber: payments.referenceNumber,
      invoiceId: invoices.id,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
    .orderBy(desc(payments.id));

  const allPayments = await paymentsQuery;

  // Filter based on user's active organization in Clerk, if applicable
  const authorizedPayments = orgId 
    ? allPayments.filter(p => p.organizationId === orgId) 
    : allPayments;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Payments"
          description="Review and verify client payments."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Payments" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <FilterBar 
            searchPlaceholder="Search payments..."
            hasFilters
          />
        
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {authorizedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900 font-mono">
                        {payment.id.split('-')[0]}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/directory/organizations/${payment.organizationId}`} className="text-gray-900 hover:text-indigo-600 transition-colors font-medium">
                      {payment.organizationName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-500 font-mono text-sm">
                      {payment.invoiceId.split('-')[0]}...
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(payment.amount / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {payment.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.referenceNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                      ${payment.status === 'succeeded' || payment.status === 'verified' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {payment.status ? payment.status.replace('_', ' ') : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {payment.status === 'pending' && (
                      <VerifyPaymentButton paymentId={payment.id} />
                    )}
                  </td>
                </tr>
              ))}
              
              {authorizedPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="h-48 p-0">
                    <div className="flex justify-center p-8">
                      <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="There are currently no payments recorded in the system."
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
