import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/crm" className="text-xl font-bold tracking-tight text-blue-600">
            Aarotech OS
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/crm/ai"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm hover:opacity-90 mb-4"
          >
            ✨ Aarotech Copilot
          </Link>
          <Link
            href="/crm"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700"
          >
            Dashboard
          </Link>
          <Link
            href="/crm/proposals"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            Proposals
          </Link>
          <Link
            href="/crm/finance"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            Finance
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agency Workspace
            </p>
          </div>
          <Link
            href="/crm/projects"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            Projects
          </Link>
          <Link
            href="/crm/kb"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            Knowledge Base
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              System
            </p>
          </div>
          <Link
            href="/crm/automations"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            Automations
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <UserButton showName />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">Admin Workspace</h1>
          <div className="flex items-center space-x-4">
            {/* Add global search or notifications here in the future */}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
