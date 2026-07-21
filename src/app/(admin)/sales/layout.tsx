import { ReactNode } from "react";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth";

export default async function SalesLayout({ children }: { children: ReactNode }) {
  // Ensure only internal users can access the sales module
  await requireInternalUser();

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="border-b border-gray-200 bg-gray-50/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">CRM & Sales</h1>
          <nav className="flex space-x-6">
            <Link href="/sales" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Overview
            </Link>
            <Link href="/sales/leads" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Leads
            </Link>
            <Link href="/sales/pipeline" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Pipeline
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
