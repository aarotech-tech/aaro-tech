import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

export default async function KnowledgeBasePage() {
  const articles = await db
    .select()
    .from(knowledgeBase)
    .orderBy(desc(knowledgeBase.createdAt));

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: any) => <span className="font-medium text-indigo-600 cursor-pointer">{row.original.title}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString(),
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Knowledge Base"
          description="SOPs, guides, and platform documentation."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory" },
            { label: "Knowledge Base" }
          ]}
          primaryAction={<Button>New Article</Button>}
        />
      </div>
      <div className="p-6 pt-0 flex-1 mt-6">
        <DataTable
          columns={columns}
          data={articles}
          searchKey="title"
          searchPlaceholder="Search articles..."
        />
      </div>
    </div>
  );
}
