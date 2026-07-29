"use client";

import { DataTable } from "@/components/ui/data-table";

export function KnowledgeClient({ articles }: { articles: any[] }) {
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
    <DataTable
      columns={columns}
      data={articles}
      searchKey="title"
      searchPlaceholder="Search articles..."
    />
  );
}
