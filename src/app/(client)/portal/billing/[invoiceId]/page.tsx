import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, FileTextIcon, HistoryIcon } from "lucide-react";
import PayInvoiceButton from "./_components/PayInvoiceButton";
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
    await financeService.processMockPayment(invoiceId, orgId);
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
          primaryAction={invoice.status === 'open' ? <PayInvoiceButton invoiceId={invoiceId} /> : undefined}
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
                <span>Custom Services</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2 text-indigo-500" />
          Payment History
        </h3>
        <div className="space-y-4">
          {invoicePayments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          ) : (
            invoicePayments.map((p: any) => (
              <div key={p.id} className="text-sm border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-semibold text-gray-900">${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'succeeded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {p.status}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs capitalize">{p.provider}</span>
                </div>
                <span className="text-xs text-gray-400">{p.createdAt?.toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
