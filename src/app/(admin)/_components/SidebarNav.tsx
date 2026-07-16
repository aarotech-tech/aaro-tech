"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  const getLinkClasses = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    if (isActive) {
      return "flex items-center px-4 py-2.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700";
    }
    return "flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100";
  };

  return (
    <nav className="flex-1 p-4 space-y-1">
      <Link
        href="/crm/ai"
        className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm hover:opacity-90 mb-4"
      >
        ✨ Aarotech Copilot
      </Link>
      <Link href="/crm" className={getLinkClasses("/crm", true)}>
        Dashboard
      </Link>
      <Link href="/crm/leads" className={getLinkClasses("/crm/leads")}>
        Website Leads
      </Link>
      <Link href="/crm/proposals" className={getLinkClasses("/crm/proposals")}>
        Proposals
      </Link>
      <Link href="/crm/finance" className={getLinkClasses("/crm/finance")}>
        Finance
      </Link>
      
      <div className="pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Agency Workspace
        </p>
      </div>
      
      <Link href="/crm/projects" className={getLinkClasses("/crm/projects")}>
        Projects
      </Link>
      <Link href="/crm/kb" className={getLinkClasses("/crm/kb")}>
        Knowledge Base
      </Link>
      
      <div className="pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          System
        </p>
      </div>
      
      <Link href="/crm/automations" className={getLinkClasses("/crm/automations")}>
        Automations
      </Link>
    </nav>
  );
}
