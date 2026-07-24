import { db } from "@/db";
import { services } from "@/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

export default async function ServicesSettingsPage() {
  const data = await db.select().from(services);

  const columns = [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }: any) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => <span className="text-gray-500 max-w-xs truncate">{row.original.description || "-"}</span>,
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }: any) => (row.original.basePrice / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    }
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Services Catalog"
          description="Manage the list of services and base prices for your agency."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: "Services" }
          ]}
          primaryAction={<Button>Add Service</Button>}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col mt-6">
        <DataTable
          columns={columns}
          data={data}
          searchKey="name"
          searchPlaceholder="Search services..."
        />
      </div>
    </div>
  );
}
