import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireAuthenticatedUser, ForbiddenError } from "@/lib/auth";

import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  if (user.userType !== "client" && user.userType !== "internal") {
    throw new ForbiddenError("Only clients can access the portal.");
  }

  // Get the client's primary organization
  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, user.id)
  });

  if (!membership && user.userType !== "internal") {
    // If they have no organization, they need to go through onboarding/invitation
    redirect("/onboarding");
  }

  const organizationId = membership?.organizationId || "internal-mock-org-id";

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
            href="/portal/home"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/portal/projects"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/portal/reviews"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Reviews
          </Link>
          <Link
            href="/portal/billing"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Billing
          </Link>
          <Link
            href="/portal/documents"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Documents
          </Link>
          <Link
            href="/portal/notifications"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Notifications
          </Link>
          <Link
            href="/portal/settings"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Settings
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
