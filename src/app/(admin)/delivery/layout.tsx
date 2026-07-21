import { ReactNode } from "react";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth";

export default async function DeliveryLayout({ children }: { children: ReactNode }) {
  await requireInternalUser();

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="border-b border-gray-200 bg-gray-50/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Delivery & Operations</h1>
          <nav className="flex space-x-6">
            <Link href="/delivery/projects" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Active Projects
            </Link>
            <Link href="/delivery/tasks" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              My Tasks
            </Link>
            <Link href="/delivery/deliverables" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Reviews
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
