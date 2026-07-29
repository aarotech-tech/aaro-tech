"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProjectTabs({ tabs }: { tabs: { name: string; href: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="flex space-x-4 border-b border-gray-200 mt-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        
        // Exact match for Overview, otherwise startsWith for nested routes
        const isActuallyActive = tab.name === "Overview" 
          ? pathname === tab.href 
          : isActive;

        return (
          <Link 
            key={tab.name}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              isActuallyActive 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
