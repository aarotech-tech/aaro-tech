import { db } from "@/db";
import { invoices, organizations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { DollarSignIcon, FileTextIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server action for mock invoice creation
async function createMockInvoice(_formData: FormData) {
  "use server";
  
  // Just find the first client organization to attach the invoice to
  const firstClient = await db.query.organizations.findFirst({
    where: eq(organizations.type, "client")
  });
  
  if (!firstClient) return;
  
  await db.insert(invoices).values({
    organizationId: firstClient.id,
    amount: 2500, // $2500
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    invoiceUrl: "#", // Mock URL
  });
  
  revalidatePath("/crm/finance");
}

export default async function FinancePage() {
  const allInvoices = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      organizationName: organizations.name,
    })
    .from(invoices)
    .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
    .orderBy(desc(invoices.createdAt));

  const totalRevenue = allInvoices
    .filter(inv => inv.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = allInvoices
    .filter(inv => inv.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Finance & Billing</h2>
          <p className="text-sm text-gray-500 mt-1">Track revenue, MRR, and outstanding invoices.</p>
        </div>
        <form action={createMockInvoice}>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            Create Invoice
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Total Collected
          </div>
          <div className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <ClockIcon className="w-4 h-4 mr-2 text-yellow-500" /> Pending Revenue
          </div>
          <div className="text-3xl font-bold text-gray-900">${pendingRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <DollarSignIcon className="w-4 h-4 mr-2 text-blue-500" /> Active Invoices
          </div>
          <div className="text-3xl font-bold text-gray-900">{allInvoices.length}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {allInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No invoices created yet.</p>
                </td>
              </tr>
            ) : (
              allInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{inv.organizationName}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">${inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${inv.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        inv.status === "paid" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{inv.dueDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href="#"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View PDF
                    </Link>
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
