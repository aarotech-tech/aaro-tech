import { db } from "@/db";
import { invoices, organizations, retainers } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { InvoicesTable } from "./InvoicesTable";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CreateInvoiceDialog } from "./_components/CreateInvoiceDialog";
import { projects } from "@/db/schema";
import { formatPaiseToINR } from "@/lib/currency";

import { ExportButton } from "@/components/shared/ExportButton";

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
    .filter(inv => ["open", "partially_paid", "overdue"].includes(inv.status!))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const orgsList = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);
  const projectsList = await db.select({ id: projects.id, name: projects.name, organizationId: projects.organizationId }).from(projects);
  const activeRetainers = await db
    .select({ amount: retainers.amount })
    .from(retainers)
    .where(eq(retainers.status, "active"));

  const totalMRR = activeRetainers.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Invoices"
          description="Manage billing and verify manual payments."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Invoices" }
          ]}
          primaryAction={
            <div className="flex gap-2">
              <ExportButton data={allInvoices} filename="invoices_export" />
              <CreateInvoiceDialog organizations={orgsList} projects={projectsList}>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" /> Create Invoice
                </Button>
              </CreateInvoiceDialog>
            </div>
          }
        />
      </div>
      
      <div className="p-6 pt-0 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</h3>
            <p className="text-3xl font-bold text-gray-900">{formatPaiseToINR(totalOutstanding)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total MRR</h3>
            <p className="text-3xl font-bold text-indigo-600">{formatPaiseToINR(totalMRR)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Retainers</h3>
            <p className="text-3xl font-bold text-gray-900">{activeRetainers.length}</p>
          </div>
        </div>

        <InvoicesTable invoices={allInvoices} />
      </div>
    </div>
  );
}
