import { getInvoiceDetails } from "@/modules/finance/services";
import { formatPaiseToINR } from "@/lib/currency";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, Calendar, Building2, CreditCard, Clock, FileText } from "lucide-react";
import { RecordPaymentButton } from "../../_components/RecordPaymentButton";
import { Button } from "@/components/ui/button";
import { SendInvoiceButton } from "./_components/SendInvoiceButton";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const invoice = await getInvoiceDetails(resolvedParams.id);
  
  if (!invoice) {
    notFound();
  }

  const isOverdue = new Date() > new Date(invoice.dueDate) && invoice.status === 'open';
  const displayStatus = isOverdue ? 'overdue' : invoice.status;

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0 max-w-5xl mx-auto w-full">
        <PageHeader 
          title={`Invoice INV-${invoice.id.substring(0, 8).toUpperCase()}`}
          description={`Billed to ${invoice.organizationName}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: `INV-${invoice.id.substring(0, 8).toUpperCase()}` }
          ]}
          secondaryActions={
            <>
              {invoice.status === 'open' && (
                <>
                  <SendInvoiceButton invoiceId={invoice.id} />
                  <RecordPaymentButton invoiceId={invoice.id} />
                </>
              )}
              <Link href={`/finance/invoices/${invoice.id}/print`} target="_blank">
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </Link>
            </>
          }
          kpiBadges={
            <Badge 
              variant={displayStatus === 'paid' ? 'default' : displayStatus === 'overdue' ? 'destructive' : 'secondary'} 
              className="capitalize px-3 py-1"
            >
              {displayStatus?.replace("_", " ")}
            </Badge>
          }
        />
      </div>

      <div className="p-6 pt-0 flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invoice Info Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Amount</span>
                <span className="font-semibold text-gray-900">{formatPaiseToINR(invoice.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Client</span>
                <span className="font-medium text-gray-900">{invoice.organizationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Issued</span>
                <span className="font-medium text-gray-900">
                  {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Due</span>
                <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Line Items</CardTitle>
                <CardDescription>Items billed in this invoice.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {(!invoice.lineItems || invoice.lineItems.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50 text-gray-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No line items detailed.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 mt-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lineItems.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{formatPaiseToINR(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatPaiseToINR(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total:</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatPaiseToINR(invoice.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
