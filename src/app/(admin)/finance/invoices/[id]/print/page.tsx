import { getInvoiceDetails } from "@/modules/finance/services";
import { formatPaiseToINR } from "@/lib/currency";
import { notFound } from "next/navigation";
import { CoreService } from "@/modules/core/services";
import PrintButton from "./PrintButton";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const invoice = await getInvoiceDetails(resolvedParams.id);
  
  if (!invoice) {
    notFound();
  }

  const org = await CoreService.getInternalOrganization();

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
          <p className="text-gray-500">INV-{invoice.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{org?.name || "Aarotech AOS"}</h2>
          <p className="text-sm text-gray-500">{org?.address}</p>
          {org?.city && <p className="text-sm text-gray-500">{org.city}, {org.country}</p>}
          {org?.taxId && <p className="text-sm text-gray-500 mt-1">Tax ID: {org.taxId}</p>}
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div>
          <p className="text-sm text-gray-500 mb-1">Billed To:</p>
          <p className="font-bold">{invoice.organizationName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Issue Date: <span className="text-black font-medium">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</span></p>
          <p className="text-sm text-gray-500">Due Date: <span className="text-black font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span></p>
        </div>
      </div>

      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems?.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-4">
                <p className="font-medium">{item.title}</p>
                {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
              </td>
              <td className="py-4 text-right font-medium">{formatPaiseToINR(item.amount)}</td>
            </tr>
          ))}
          {(!invoice.lineItems || invoice.lineItems.length === 0) && (
            <tr>
              <td className="py-4 text-center text-gray-500" colSpan={2}>No line items</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between border-t-2 border-black pt-4">
            <span className="font-bold">Total Due:</span>
            <span className="font-bold text-xl">{formatPaiseToINR(invoice.amount)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center text-sm text-gray-500 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
