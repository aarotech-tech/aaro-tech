import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireAuthenticatedUser, ForbiddenError } from "@/lib/auth";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  if (user.userType !== "client" && user.userType !== "internal") {
    throw new ForbiddenError("Only clients can access the portal.");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
      {/* Sidebar - Dark theme for a premium feel */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/portal" className="text-xl font-bold tracking-tight text-white">
            Aarotech<span className="text-blue-500">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/portal"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md bg-gray-800 text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/portal/assets"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            My Assets
          </Link>
          <Link
            href="/portal/deliverables"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Deliverables
          </Link>
          <Link
            href="/portal/billing"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Billing & Invoices
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <UserButton showName appearance={{ elements: { userButtonBox: "text-white" } }} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
