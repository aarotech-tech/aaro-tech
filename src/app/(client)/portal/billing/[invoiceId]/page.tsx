import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, FileTextIcon, HistoryIcon } from "lucide-react";
import PayInvoiceButton from "./_components/PayInvoiceButton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAuthenticatedUser } from "@/lib/auth";
import { financeService } from "@/modules/finance/services";
import { portalService } from "@/modules/portal/services";

export default async function ClientInvoiceDetailsPage(
  props: { params: Promise<{ invoiceId: string }>, searchParams: Promise<{ success?: string, canceled?: string, mock_payment?: string }> }
) {
  const searchParams = await props.searchParams;
  const resolvedParams = await props.params;
  const invoiceId = resolvedParams.invoiceId;

  const user = await requireAuthenticatedUser();
  const membershipData = await portalService.getClientMembership(user.id);
  if (!membershipData || !membershipData.myOrg) {
    redirect("/onboarding");
  }
  
  const orgId = membershipData.myOrg.id;

  // Handle mock payment success
  if (searchParams.mock_payment === 'success') {
    /* mock payment disabled */
  }

  const details = await financeService.getClientInvoiceDetails(invoiceId, orgId);
  
  if (!details) notFound();

  const { invoice, project, period, payments: invoicePayments } = details;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-4xl mx-auto w-full">
        <PageHeader 
          title={`Invoice INV-${invoice.id.substring(0, 8).toUpperCase()}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/portal/home" },
            { label: "Billing", href: "/portal/billing" },
            { label: `INV-${invoice.id.substring(0, 8).toUpperCase()}` }
          ]}
          kpiBadges={
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
              invoice.status === 'open' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {invoice.status}
            </span>
          }
          primaryAction={invoice.status === 'open' ? <PayInvoiceButton invoiceId={invoiceId} amount={invoice.amount} orgId={orgId} /> : undefined}
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-4xl mx-auto w-full space-y-6">

      {searchParams.success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-700">
          <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>Payment successful! It may take a moment for your receipt to be generated.</p>
        </div>
      )}

      {searchParams.canceled && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-amber-700">
          <p>Payment was canceled. You can try again when you're ready.</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between mb-8 pb-8 border-b border-gray-200">
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Amount Due</h3>
            <div className="text-4xl font-bold text-gray-900">${(invoice.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <h3 className="text-gray-500 font-medium mb-1">Due Date</h3>
            <div className="text-lg font-semibold text-gray-900">{invoice.dueDate.toLocaleDateString()}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description of Services</h3>
          <ul className="space-y-4">
            {project && (
              <li className="flex justify-between items-center text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span>Project: {project.name}</span>
              </li>
            )}
            {period && (
              <li className="flex justify-between items-center text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span>Retainer Period: {period.periodName}</span>
              </li>
            )}
            {!project && !period && (
              <li className="flex justify-between items-center text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span>General Services</span>
              </li>
            )}
          </ul>
        </div>

        {invoice.status === 'open' && (
          <div className="mt-8 bg-blue-50/50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Instructions</h3>
            <p className="text-sm text-blue-800 mb-4">
              Please transfer the due amount to the following bank account. Once transferred, click "I Have Sent Payment" above to submit your UTR/Reference number.
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm border border-blue-100 text-gray-800 space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Bank Name:</span> <strong>Global Standard Bank</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Account Name:</span> <strong>Aarotech Solutions</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Account No:</span> <strong>3908 4567 1234 9876</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">IFSC/SWIFT:</span> <strong>GSB0001234</strong></div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500">Need a copy?</h3>
            <Button variant="outline" className="text-gray-700 shadow-sm" onClick={() => window.print()}>
              <FileTextIcon className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {invoicePayments && invoicePayments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2 text-gray-500" />
            Payment History
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Ref</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoicePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 capitalize">{p.method?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-mono text-xs">{p.referenceNumber || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
