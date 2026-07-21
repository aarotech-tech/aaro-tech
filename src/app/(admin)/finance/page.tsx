import { db } from "@/db";
import { invoices, organizations } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
// Would import a RecordPaymentModal client component here

export default async function AdminFinancePage() {
  const allInvoices = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      organizationName: organizations.name,
    })
    .from(invoices)
    .leftJoin(organizations, eq(invoices.organizationId, organizations.id))
    .orderBy(desc(invoices.createdAt));

  const totalOutstanding = allInvoices
    .filter(inv => ["sent", "viewed", "partially_paid", "overdue"].includes(inv.status!))
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 h-full overflow-y-auto max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-500 mt-1">Manage billing and verify manual payments.</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">${(totalOutstanding / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              allInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-gray-900 font-mono text-sm">
                    INV-{inv.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{inv.organizationName}</TableCell>
                  <TableCell className="font-semibold">
                    ${(inv.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      inv.status === 'paid' ? 'default' : 
                      inv.status === 'overdue' ? 'destructive' : 'secondary'
                    } className="capitalize">
                      {inv.status?.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.dueDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="secondary" size="sm">Record Payment</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
