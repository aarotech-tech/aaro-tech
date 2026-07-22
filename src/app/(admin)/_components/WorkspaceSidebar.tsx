"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkspaceConfig } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function WorkspaceSidebar({ config }: { config: WorkspaceConfig }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
          {config.name} Workspace
        </h2>
      </div>
      
      {config.groups.map((group, idx) => (
        <div key={idx} className="space-y-1">
          {group.name && (
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {group.name}
            </p>
          )}
          {group.items.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
