import { PageHeader } from "@/components/ui/page-header";
import { financeService } from "@/modules/finance/services";
import { notFound } from "next/navigation";
import { formatPaiseToINR } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { UpdateRetainerStatusDialog } from "../_components/UpdateRetainerStatusDialog";
import { Button } from "@/components/ui/button";

export default async function RetainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await financeService.getRetainerDetails(id);
  
  if (!data) {
    notFound();
  }

  const { retainer, periods, invoices } = data;

  const invoiceMap = new Map(invoices.map(i => [i.retainerPeriodId, i]));

  const periodColumns = [
    {
      accessorKey: "periodName",
      header: "Period",
    },
    {
      accessorKey: "startDate",
      header: "Dates",
      cell: ({ row }: any) => {
        const start = new Date(row.original.startDate).toLocaleDateString();
        const end = new Date(row.original.endDate).toLocaleDateString();
        return `${start} - ${end}`;
      }
    },
    {
      id: "invoice",
      header: "Invoice Status",
      cell: ({ row }: any) => {
        const invoice = invoiceMap.get(row.original.id);
        if (!invoice) return <span className="text-gray-400">No Invoice</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
            <Badge variant="outline" className="capitalize">{invoice.status}</Badge>
          </div>
        );
      }
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-6 pb-0">
        <PageHeader 
          title={retainer.name}
          description={`Retainer for ${(retainer.organization as any)?.name || 'Client'}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Retainers", href: "/finance/retainers" },
            { label: retainer.name }
          ]}
          kpiBadges={
            <Badge variant="secondary" className="capitalize text-sm px-3 py-1 bg-indigo-100 text-indigo-800">
              {retainer.status}
            </Badge>
          }
          secondaryActions={
            <div className="flex gap-2">
              {retainer.status === 'active' && (
                <UpdateRetainerStatusDialog
                  retainerId={retainer.id}
                  status="paused"
                  title="Pause Retainer"
                  description="This will temporarily stop generating billing periods."
                  actionText="Pause Retainer"
                  variant="outline"
                >
                  <Button variant="outline">Pause</Button>
                </UpdateRetainerStatusDialog>
              )}
              {retainer.status === 'paused' && (
                <UpdateRetainerStatusDialog
                  retainerId={retainer.id}
                  status="active"
                  title="Resume Retainer"
                  description="This will resume generating billing periods."
                  actionText="Resume Retainer"
                >
                  <Button variant="outline">Resume</Button>
                </UpdateRetainerStatusDialog>
              )}
              {retainer.status !== 'cancelled' && (
                <UpdateRetainerStatusDialog
                  retainerId={retainer.id}
                  status="cancelled"
                  title="Cancel Retainer"
                  description="Are you sure you want to permanently cancel this retainer? This cannot be undone."
                  actionText="Cancel Retainer"
                  variant="destructive"
                >
                  <Button variant="destructive">Cancel</Button>
                </UpdateRetainerStatusDialog>
              )}
            </div>
          }
        />
      </div>

      <div className="p-6 pt-6 flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPaiseToINR(retainer.amount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Billing Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(retainer.startDate).getDate()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(retainer.startDate).toLocaleDateString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">End Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {"Ongoing"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Billing Periods</h2>
            <p className="text-sm text-gray-500">History of generated retainer periods and invoices.</p>
          </div>
          <div className="p-6 pt-0">
            {periods.length > 0 ? (
              <DataTable
                columns={periodColumns}
                data={periods}
                searchKey="periodName"
                searchPlaceholder="Search periods..."
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No billing periods generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
