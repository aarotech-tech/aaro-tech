import { db } from "@/db";
import { invoices, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, FileTextIcon } from "lucide-react";

export default async function ClientBillingPage() {
  await auth.protect();
  
  const myOrg = await db.query.organizations.findFirst({
    where: eq(organizations.type, "client")
  });

  if (!myOrg) {
    return <div className="text-white">No active organization found.</div>;
  }

  const myInvoices = await db.query.invoices.findMany({
    where: eq(invoices.organizationId, myOrg.id),
    orderBy: [desc(invoices.createdAt)]
  });

  const totalDue = myInvoices
    .filter(inv => inv.status === "pending" || inv.status === "overdue")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-400 mt-2">Manage your account balance and payment history.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-gray-400 font-medium mb-1">Outstanding Balance</h3>
          <div className="text-4xl font-bold text-white">${totalDue.toLocaleString()}</div>
        </div>
        {totalDue > 0 && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg px-8">
            <CreditCardIcon className="w-4 h-4 mr-2" /> Pay Balance
          </Button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex-1">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 border-b border-gray-800 text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Invoice ID</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileTextIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p>No invoices have been issued to your account.</p>
                  </div>
                </td>
              </tr>
            ) : (
              myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-400">
                    INV-{inv.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${inv.status === "pending" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-900/50" : 
                        inv.status === "paid" ? "bg-green-900/50 text-green-400 border border-green-900/50" : 
                        "bg-red-900/50 text-red-400 border border-red-900/50"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{inv.dueDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={inv.invoiceUrl || "#"} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                      View PDF
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
