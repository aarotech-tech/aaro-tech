import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { SidebarNav } from "./_components/SidebarNav";

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
        <SidebarNav />
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
