import { ReactNode } from "react";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requireInternalUser();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Organization Settings</h1>
        </div>
      </header>
      <div className="flex-1 overflow-hidden container mx-auto flex">
        <aside className="w-64 border-r border-gray-200 bg-white p-4 hidden md:block overflow-y-auto">
          <nav className="space-y-1">
            <Link href="/settings" className="block px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
              General
            </Link>
            <Link href="/settings/team" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Team Members
            </Link>
            <Link href="/settings/branding" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Branding
            </Link>
            <Link href="/settings/billing" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Billing Defaults
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
