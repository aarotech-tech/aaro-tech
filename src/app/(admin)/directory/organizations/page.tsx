import { db } from "@/db";
import { organizations } from "@/db/schema";
import { isNull } from "drizzle-orm";
import Link from "next/link";
import { Building2, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";

export default async function OrganizationsDirectoryPage() {
  const orgs = await db
    .select()
    .from(organizations)
    .where(isNull(organizations.deletedAt));

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Organizations Directory"
          description="The master record of all clients, prospects, and internal entities."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Directory", href: "/directory/organizations" },
            { label: "Organizations" }
          ]}
        />
      </div>
      
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <FilterBar 
            searchPlaceholder="Search organizations..."
            hasFilters
            onSearch={() => {}}
            onFilterClick={() => {}}
          />
        
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/directory/organizations/${org.id}`} className="flex items-center group">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {org.name}
                        </div>
                        {org.city && (
                          <div className="text-sm text-gray-500">{org.city}{org.country ? `, ${org.country}` : ""}</div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {org.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[4rem]">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${org.healthScore || 0}%` }}></div>
                      </div>
                      {org.healthScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
              
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
