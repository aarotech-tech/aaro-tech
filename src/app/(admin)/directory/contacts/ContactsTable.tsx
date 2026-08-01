"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function ContactsTable({ contacts }: { contacts: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const contact = row.original;
        const fullName = contact.name || "Unknown Contact";
        
        // Get initials from single name field (e.g. "John Doe" -> "JD")
        const nameParts = fullName.split(" ");
        const initials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : `${fullName[0] || ""}`.toUpperCase() || "?";
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{fullName}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "organizationName",
      header: "Organization",
      cell: ({ row }) => (
        <Link href={`/directory/organizations/${row.original.organizationId}`} className="text-indigo-600 hover:underline">
          {row.original.organizationName || "Unknown"}
        </Link>
      ),
    },
    {
      id: "contact",
      header: "Contact Info",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-sm">
          {row.original.email && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Mail className="h-3 w-3" />
              <a href={`mailto:${row.original.email}`} className="hover:text-indigo-600">{row.original.email}</a>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone className="h-3 w-3" />
              <a href={`tel:${row.original.phone}`} className="hover:text-indigo-600">{row.original.phone}</a>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={contacts} 
      searchKey="name" 
      searchPlaceholder="Search contacts..." 
    />
  );
}
