import { ReactNode } from "react";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth";

export default async function FinanceLayout({ children }: { children: ReactNode }) {
  await requireInternalUser();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Finance & Billing</h1>
          <nav className="flex space-x-6">
            <Link href="/finance" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Invoices
            </Link>
            <Link href="/finance/payments" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Payments
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
