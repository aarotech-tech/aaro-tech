import { db } from "@/db";
import { retainers, organizations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function RetainersPage() {
  const data = await db
    .select({
      id: retainers.id,
      name: retainers.name,
      amount: retainers.amount,
      status: retainers.status,
      startDate: retainers.startDate,
      organization: {
        name: organizations.name,
      }
    })
    .from(retainers)
    .innerJoin(organizations, eq(retainers.organizationId, organizations.id))
    .orderBy(desc(retainers.createdAt));

  const columns = [
    {
      accessorKey: "name",
      header: "Retainer",
      cell: ({ row }: any) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      accessorKey: "organization",
      header: "Client",
      cell: ({ row }: any) => row.original.organization.name,
    },
    {
      accessorKey: "amount",
      header: "MRR",
      cell: ({ row }: any) => (row.original.amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const s = row.original.status;
        const color = 
          s === "active" ? "bg-emerald-100 text-emerald-800" :
          s === "paused" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800";
        return (
          <Badge variant="secondary" className={color}>
            {s}
          </Badge>
        );
      }
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }: any) => new Date(row.original.startDate).toLocaleDateString(),
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Retainers"
          description="Manage recurring revenue streams and retainers."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance", href: "/finance" },
            { label: "Retainers" }
          ]}
          primaryAction={<Button>New Retainer</Button>}
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <DataTable
          columns={columns}
          data={data}
          searchKey="name"
          searchPlaceholder="Search retainers..."
        />
      </div>
    </div>
  );
}
