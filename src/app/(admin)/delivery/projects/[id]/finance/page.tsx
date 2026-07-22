import { db } from "@/db";
import { invoices, payments, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { RecordPaymentDialog } from "./RecordPaymentDialog";

export default async function ProjectFinancePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [project] = await db
    .select({
      id: projects.id,
      organizationId: projects.organizationId,
    })
    .from(projects)
    .where(eq(projects.id, resolvedParams.id));

  if (!project) notFound();

  const projectInvoices = await db.query.invoices.findMany({
    where: eq(invoices.projectId, resolvedParams.id),
    orderBy: [desc(invoices.createdAt)],
    with: {
      payments: true,
    }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Invoices & Payments</h2>
        {/* Can add Generate Invoice button here */}
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        {projectInvoices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No invoices have been generated for this project yet.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectInvoices.map(invoice => {
                const totalPaid = (invoice as any).payments
                  .filter((p: any) => p.status === 'succeeded')
                  .reduce((sum: number, p: any) => sum + p.amount, 0);
                
                const balance = invoice.amount - totalPaid;

                return (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600 truncate max-w-[120px]">{invoice.id}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.amount / 100)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance / 100)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'open' ? 'secondary' : 'outline'} className="capitalize">
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status !== 'paid' && (
                        <RecordPaymentDialog 
                          invoiceId={invoice.id} 
                          projectId={project.id} 
                          organizationId={project.organizationId} 
                          balanceAmount={balance} 
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
