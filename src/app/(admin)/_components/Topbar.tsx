"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Search, Bell, ChevronDown } from "lucide-react";
import { WORKSPACE_LIST } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;
  
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine active workspace
  const activeWorkspace = WORKSPACE_LIST.find(ws => pathname.startsWith(`/${ws.id}`)) || WORKSPACE_LIST[0];

  // Filter accessible workspaces
  const accessibleWorkspaces = WORKSPACE_LIST.filter(ws => {
    if (ws.requiredRole && ws.requiredRole !== userRole && userRole !== "admin") return false;
    return true;
  });

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center flex-1">
        {/* Workspace Switcher */}
        <div className="relative mr-8" ref={switcherRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-1.5 rounded-md">
              <activeWorkspace.icon className="h-5 w-5 text-blue-700" />
            </div>
            <span className="font-semibold text-sm">{activeWorkspace.name}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isSwitcherOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                Switch Workspace
              </div>
              {accessibleWorkspaces.map(ws => (
                <Link
                  key={ws.id}
                  href={ws.defaultPath}
                  onClick={() => setIsSwitcherOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm transition-colors",
                    activeWorkspace.id === ws.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <ws.icon className={cn("mr-3 h-4 w-4", activeWorkspace.id === ws.id ? "text-blue-700" : "text-gray-400")} />
                  {ws.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Placeholder */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search across all workspaces (Cmd+K)"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="pl-2 border-l border-gray-200">
          <UserButton showName />
        </div>
      </div>
    </header>
  );
}
