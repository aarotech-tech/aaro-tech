"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, LayoutDashboard, Briefcase, FileCheck, DollarSign, Users, Settings } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { WorkspaceConfig, WORKSPACE_LIST } from "@/lib/constants/navigation";

interface AdminShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  configId?: string;
}

export function AdminShell({ children, sidebar, configId }: AdminShellProps) {
  const pathname = usePathname();
  const config = configId ? WORKSPACE_LIST.find(w => w.id === configId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Topbar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-20 sticky top-0">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Aarotech</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          {/* Workspace Switcher */}
          <div className="flex space-x-1">
            {WORKSPACE_LIST.map((w) => {
              const isActive = pathname.startsWith("/" + w.id);
              return (
                <Link
                  key={w.name}
                  href={w.defaultPath}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <w.icon className="h-4 w-4 mr-2" />
                  {w.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <GlobalSearch />
          
          <Link href="/inbox" className="text-gray-500 hover:text-gray-700 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Link>

          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {config && (
          <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block flex-shrink-0">
            <nav className="p-4 space-y-6">
              {config.groups.map((group, i) => (
                <div key={i}>
                  {group.name && <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.name}</h3>}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            isItemActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                          }`}
                        >
                          <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isItemActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"}`} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
