import { db } from "@/db";
import { invoices, payments, projects, retainerPeriods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, FileTextIcon, HistoryIcon } from "lucide-react";
import PayInvoiceButton from "./_components/PayInvoiceButton";

export default async function ClientInvoiceDetailsPage(
  props: { params: Promise<{ invoiceId: string }>, searchParams: Promise<{ success?: string, canceled?: string, mock_payment?: string }> }
) {
  const searchParams = await props.searchParams;
  const resolvedParams = await props.params;
  const invoiceId = resolvedParams.invoiceId;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId)
  });

  if (!invoice) notFound();

  // Handle mock payment success
  if (searchParams.mock_payment === 'success' && invoice.status !== 'paid') {
    await db.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, invoiceId));
    await db.insert(payments).values({
      invoiceId,
      amount: invoice.amount,
      status: 'succeeded',
      provider: 'stripe (mock)',
      paidAt: new Date()
    });
    invoice.status = 'paid';
  }

  let project = null;
  if (invoice.projectId) {
    project = await db.query.projects.findFirst({ where: eq(projects.id, invoice.projectId) });
  }

  let period = null;
  if (invoice.retainerPeriodId) {
    period = await db.query.retainerPeriods.findFirst({ where: eq(retainerPeriods.id, invoice.retainerPeriodId) });
  }

  const invoicePayments = await db.query.payments.findMany({
    where: eq(payments.invoiceId, invoiceId),
    orderBy: [desc(payments.createdAt)]
  });

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-8">
        <Link href="/portal/billing" className="text-blue-400 hover:underline text-sm mb-4 inline-flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Billing
        </Link>
        <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
              <FileTextIcon className="w-8 h-8 mr-3 text-blue-500" />
              Invoice INV-{invoice.id.substring(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-400 mt-2 flex items-center space-x-3">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-900/50 text-green-400' :
                  invoice.status === 'open' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-gray-800 text-gray-400'
                }`}>
                {invoice.status}
              </span>
            </p>
          </div>

          {invoice.status === 'open' && (
            <PayInvoiceButton invoiceId={invoiceId} />
          )}
        </div>
      </div>

      {searchParams.success && (
        <div className="mb-8 p-4 bg-green-900/30 border border-green-800 rounded-lg flex items-center text-green-400">
          <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>Payment successful! It may take a moment for your receipt to be generated.</p>
        </div>
      )}

      {searchParams.canceled && (
        <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg flex items-center text-yellow-400">
          <p>Payment was canceled. You can try again when you're ready.</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between mb-8 pb-8 border-b border-gray-800">
          <div>
            <h3 className="text-gray-400 font-medium mb-1">Amount Due</h3>
            <div className="text-4xl font-bold text-white">${(invoice.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <h3 className="text-gray-400 font-medium mb-1">Due Date</h3>
            <div className="text-lg font-semibold text-gray-200">{invoice.dueDate.toLocaleDateString()}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Description of Services</h3>
          <ul className="space-y-4">
            {project && (
              <li className="flex justify-between items-center text-gray-300 bg-gray-950 p-4 rounded-lg border border-gray-800">
                <span>Project: {project.name}</span>
              </li>
            )}
            {period && (
              <li className="flex justify-between items-center text-gray-300 bg-gray-950 p-4 rounded-lg border border-gray-800">
                <span>Retainer Period: {period.periodName}</span>
              </li>
            )}
            {!project && !period && (
              <li className="flex justify-between items-center text-gray-300 bg-gray-950 p-4 rounded-lg border border-gray-800">
                <span>Custom Services</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 h-fit">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2 text-blue-500" />
          Payment History
        </h3>
        <div className="space-y-4">
          {invoicePayments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          ) : (
            invoicePayments.map(p => (
              <div key={p.id} className="text-sm border border-gray-800 rounded-lg p-4 bg-gray-950 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-semibold text-gray-200">${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'succeeded' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
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
  );
}
