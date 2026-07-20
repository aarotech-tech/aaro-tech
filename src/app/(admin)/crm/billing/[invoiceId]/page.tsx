import { db } from "@/db";
import { invoices, payments, organizations, projects, retainerPeriods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ReceiptIcon, BuildingIcon, BriefcaseIcon, CalendarIcon } from "lucide-react";
import MarkPaidButton from "./_components/MarkPaidButton";

export default async function AdminInvoiceDetailsPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const resolvedParams = await params;
  const invoiceId = resolvedParams.invoiceId;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId)
  });
  if (!invoice) notFound();

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, invoice.organizationId)
  });

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/crm/billing" className="text-indigo-600 hover:underline text-sm mb-4 inline-flex items-center">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Billing
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
            Invoice details
          </h1>
          <p className="text-sm text-gray-500 mt-1">ID: {invoice.id}</p>
        </div>
        {invoice.status === 'open' && (
          <MarkPaidButton invoiceId={invoiceId} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">${(invoice.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {invoice.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Due Date</p>
                <p className="text-gray-900 font-semibold">{invoice.dueDate.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Associated Work</h3>
              {project && (
                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md mb-2">
                  <BriefcaseIcon className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-medium">Project:</span> <span className="ml-2">{project.name}</span>
                </div>
              )}
              {period && (
                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-md">
                  <CalendarIcon className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-medium">Retainer Period:</span> <span className="ml-2">{period.periodName}</span>
                </div>
              )}
              {!project && !period && (
                <p className="text-sm text-gray-500 italic">No specific project or retainer period linked.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <ReceiptIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Payment Transactions
            </h3>
            {invoicePayments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {invoicePayments.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Provider: {p.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{p.createdAt?.toLocaleString()}</p>
                      {p.providerPaymentId && (
                        <p className="text-[10px] text-gray-400 font-mono mt-1" title={p.providerPaymentId}>
                          ID: {p.providerPaymentId.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <BuildingIcon className="w-5 h-5 mr-2 text-indigo-600" />
            Client Details
          </h3>
          {org ? (
            <div>
              <p className="font-semibold text-gray-900 text-lg">{org.name}</p>
              <Link href={`/crm/organizations/${org.id}`} className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                View Organization Profile &rarr;
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Organization not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
